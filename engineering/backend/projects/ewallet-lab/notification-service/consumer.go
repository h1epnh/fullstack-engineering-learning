package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
	"github.com/aws/aws-sdk-go-v2/service/sqs/types"
)

// waitTimeSeconds MUST stay at the SQS maximum (20). ADR-06's cost note (DESIGN.md) is explicit:
// short polling an empty queue every 1-2s for a month alone approaches the SQS free-tier request
// quota (1,000,000/month) just from EMPTY polls. Long polling cuts that by ~20x. Do not lower this
// to "feel more responsive" — it is load-bearing for staying inside the free tier, not a tuning
// knob.
const waitTimeSeconds = 20

const maxMessagesPerPoll = 10

// runConsumeLoop long-polls queueURL until ctx is cancelled. Each received message is parsed,
// deduped by eventId, and on successful "delivery" (logged, simulated — see main.go's doc
// comment) explicitly deleted. On any failure (parse error, unknown schema) the message is left
// alone: NOT deleted, so SQS's own visibility-timeout/redrive machinery retries it, and after
// maxReceiveCount=5 (set on the queue by scripts/init-aws-infra.sh) it lands in the DLQ
// (ewallet-lab-payment-completed-notify-dlq) on its own — this process never manually routes to
// the DLQ itself.
func runConsumeLoop(ctx context.Context, client *sqs.Client, queueURL string, cache *idempotencyCache) {
	for {
		if ctx.Err() != nil {
			return
		}
		out, err := client.ReceiveMessage(ctx, &sqs.ReceiveMessageInput{
			QueueUrl:            aws.String(queueURL),
			MaxNumberOfMessages: maxMessagesPerPoll,
			WaitTimeSeconds:     waitTimeSeconds,
		})
		if err != nil {
			if ctx.Err() != nil {
				return // shutting down, the Receive call's own context cancellation caused this error
			}
			log.Printf("ReceiveMessage error: %v (will retry after the next long-poll wait)", err)
			continue
		}
		for _, msg := range out.Messages {
			handleMessage(ctx, client, queueURL, msg, cache)
		}
	}
}

func handleMessage(ctx context.Context, client *sqs.Client, queueURL string, msg types.Message, cache *idempotencyCache) {
	receiptHandle := aws.ToString(msg.ReceiptHandle)
	body := aws.ToString(msg.Body)

	event, err := parseEvent(body)
	if err != nil {
		log.Printf("messageId=%s: failed to parse payment.completed event, leaving for redrive: %v",
			aws.ToString(msg.MessageId), err)
		return // do NOT delete — let it redrive towards the DLQ
	}

	if cache.seenBefore(event.EventID) {
		log.Printf("eventId=%s: duplicate delivery (at-least-once), already processed — skipping, deleting",
			event.EventID)
		deleteMessage(ctx, client, queueURL, receiptHandle, event.EventID)
		return
	}

	// Simulated notification delivery — this lab never calls a real push/SMS/email provider (see
	// main.go's doc comment). A structured log line IS the "send".
	log.Printf("NOTIFY userId=%s transactionId=%s type=%s direction=%s amount=%s reference=%s eventId=%s occurredAt=%s",
		event.UserID, event.TransactionID, event.TransactionType, event.Direction, event.Amount,
		event.Reference, event.EventID, event.OccurredAt)

	deleteMessage(ctx, client, queueURL, receiptHandle, event.EventID)
}

func deleteMessage(ctx context.Context, client *sqs.Client, queueURL, receiptHandle, eventID string) {
	_, err := client.DeleteMessage(ctx, &sqs.DeleteMessageInput{
		QueueUrl:      aws.String(queueURL),
		ReceiptHandle: aws.String(receiptHandle),
	})
	if err != nil {
		// Not fatal: worst case SQS redelivers after the visibility timeout and handleMessage's own
		// dedupe (seenBefore, already recorded above) treats the redelivery as a duplicate.
		log.Printf("eventId=%s: DeleteMessage failed (will redeliver, dedupe will catch it): %v", eventID, err)
	}
}

// parseEvent accepts either form of SQS message body coming from an SNS->SQS subscription:
//  1. Raw message delivery enabled (what scripts/init-aws-infra.sh's subscribe call sets,
//     RawMessageDelivery=true) — the body IS the PaymentCompletedEvent JSON directly.
//  2. Raw message delivery NOT enabled (SNS's default if the subscription attribute were ever
//     missing/reset) — the body is SNS's own envelope ({"Type":"Notification","Message":"<json
//     string>",...}), and the real event is the JSON-encoded STRING in "Message".
//
// Handling both defensively means a subscription misconfiguration degrades to "still parses
// correctly" instead of "every message silently fails to parse".
func parseEvent(body string) (PaymentCompletedEvent, error) {
	var direct PaymentCompletedEvent
	if err := json.Unmarshal([]byte(body), &direct); err == nil && direct.EventID != "" && direct.SchemaVersion != 0 {
		return direct, nil
	}

	var envelope snsEnvelope
	if err := json.Unmarshal([]byte(body), &envelope); err != nil {
		return PaymentCompletedEvent{}, fmt.Errorf("body is neither a direct event nor an SNS envelope: %w", err)
	}
	if envelope.Message == "" {
		return PaymentCompletedEvent{}, errors.New("SNS envelope has no Message field")
	}
	var wrapped PaymentCompletedEvent
	if err := json.Unmarshal([]byte(envelope.Message), &wrapped); err != nil {
		return PaymentCompletedEvent{}, fmt.Errorf("SNS envelope Message is not a valid event: %w", err)
	}
	if wrapped.EventID == "" || wrapped.SchemaVersion == 0 {
		return PaymentCompletedEvent{}, errors.New("parsed event is missing eventId/schemaVersion")
	}
	return wrapped, nil
}
