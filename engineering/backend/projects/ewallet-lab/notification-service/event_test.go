package main

import "testing"

// Fixed vector following ADR-06's documented schema (DESIGN.md) exactly — same style as
// mock-bank-gateway/collection_test.go's fixed-vector approach for its signature.
const directEventJSON = `{
  "schemaVersion": 1,
  "eventId": "11111111-1111-1111-1111-111111111111",
  "eventType": "payment.completed",
  "occurredAt": "2026-10-29T10:00:00Z",
  "transactionId": "22222222-2222-2222-2222-222222222222",
  "userId": "33333333-3333-3333-3333-333333333333",
  "transactionType": "TRANSFER_OUT",
  "direction": "OUT",
  "amount": "150000.00",
  "reference": "33333333-3333-3333-3333-333333333333"
}`

func TestParseEvent_DirectDelivery(t *testing.T) {
	event, err := parseEvent(directEventJSON)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if event.EventID != "11111111-1111-1111-1111-111111111111" {
		t.Errorf("eventId = %q", event.EventID)
	}
	if event.TransactionType != "TRANSFER_OUT" {
		t.Errorf("transactionType = %q", event.TransactionType)
	}
	if event.Direction != "OUT" {
		t.Errorf("direction = %q", event.Direction)
	}
	if event.SchemaVersion != 1 {
		t.Errorf("schemaVersion = %d", event.SchemaVersion)
	}
}

func TestParseEvent_SnsEnvelopeDelivery(t *testing.T) {
	// SNS's own wrapping when raw message delivery is NOT enabled — the real payload is a
	// JSON-encoded STRING under "Message". Built with Go's own json.Marshal semantics in mind:
	// double quotes inside the string are escaped as \".
	envelope := `{"Type":"Notification","MessageId":"abc-123","TopicArn":"arn:aws:sns:ap-southeast-1:456021728709:ewallet-lab-payment-completed","Message":"{\"schemaVersion\":1,\"eventId\":\"44444444-4444-4444-4444-444444444444\",\"eventType\":\"payment.completed\",\"occurredAt\":\"2026-10-29T10:00:00Z\",\"transactionId\":\"55555555-5555-5555-5555-555555555555\",\"userId\":\"66666666-6666-6666-6666-666666666666\",\"transactionType\":\"TOPUP\",\"direction\":\"IN\",\"amount\":\"200000.00\",\"reference\":\"bank-ref-1\"}","Timestamp":"2026-10-29T10:00:01.000Z"}`

	event, err := parseEvent(envelope)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if event.EventID != "44444444-4444-4444-4444-444444444444" {
		t.Errorf("eventId = %q", event.EventID)
	}
	if event.TransactionType != "TOPUP" {
		t.Errorf("transactionType = %q", event.TransactionType)
	}
	if event.Direction != "IN" {
		t.Errorf("direction = %q", event.Direction)
	}
}

func TestParseEvent_InvalidBody(t *testing.T) {
	if _, err := parseEvent(`not json at all`); err == nil {
		t.Fatal("expected an error for non-JSON body")
	}
	if _, err := parseEvent(`{"foo":"bar"}`); err == nil {
		t.Fatal("expected an error for JSON missing eventId/schemaVersion")
	}
}

func TestIdempotencyCache_DedupesAndEvicts(t *testing.T) {
	cache := newIdempotencyCache(2)

	if cache.seenBefore("a") {
		t.Fatal("first sight of \"a\" should not be a duplicate")
	}
	if !cache.seenBefore("a") {
		t.Fatal("second sight of \"a\" should be a duplicate")
	}
	if cache.seenBefore("b") {
		t.Fatal("first sight of \"b\" should not be a duplicate")
	}
	// capacity is 2 ("a","b" already in) — adding "c" must evict the oldest ("a").
	if cache.seenBefore("c") {
		t.Fatal("first sight of \"c\" should not be a duplicate")
	}
	if cache.seenBefore("a") {
		t.Fatal("\"a\" should have been evicted by capacity and treated as new again")
	}
}
