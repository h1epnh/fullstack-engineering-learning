package main

// PaymentCompletedEvent mirrors ADR-06's schema in backend DESIGN.md ("Schema" bullet under
// "ADR-06. SNS + SQS thật trên AWS..."). Field names/values are NOT invented here — every value
// is wallet-service's own TransactionType/Transaction field, published verbatim. Do not add a
// field here without adding it to DESIGN.md's ADR-06 schema first (CLAUDE.md's explicit warning
// about services inventing fields/enum values for each other).
type PaymentCompletedEvent struct {
	SchemaVersion   int    `json:"schemaVersion"`
	EventID         string `json:"eventId"`
	EventType       string `json:"eventType"`
	OccurredAt      string `json:"occurredAt"`
	TransactionID   string `json:"transactionId"`
	UserID          string `json:"userId"`
	TransactionType string `json:"transactionType"`
	Direction       string `json:"direction"`
	Amount          string `json:"amount"`
	Reference       string `json:"reference"`
}

// snsEnvelope is what actually arrives in the SQS message body when a queue is subscribed to an
// SNS topic WITHOUT "raw message delivery" enabled (the default, and what
// scripts/init-aws-infra.sh's `aws sns subscribe` leaves in place — no
// `--attributes RawMessageDelivery=true`): SNS wraps the real payload as a JSON STRING under
// "Message", alongside its own envelope fields (Type/MessageId/TopicArn/Timestamp/...). Consuming
// this correctly means unwrapping twice: outer JSON (this struct) then re-parsing .Message as the
// real PaymentCompletedEvent. Getting this wrong (parsing the SQS body directly as
// PaymentCompletedEvent) would silently fail every single message, not just a subset.
type snsEnvelope struct {
	Type    string `json:"Type"`
	Message string `json:"Message"`
}
