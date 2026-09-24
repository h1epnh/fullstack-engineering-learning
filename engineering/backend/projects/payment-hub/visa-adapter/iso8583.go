package main

import (
	"fmt"
	"math/rand"
	"time"
)

// RoutingEvent mirrors the outbox payload published by the orchestrator
// (see orchestrator/.../service/TransactionWriter.persistRouted).
type RoutingEvent struct {
	TransactionID string `json:"transactionId"`
	Rail          string `json:"rail"`
	SourceAccount string `json:"sourceAccount"`
	DestAccount   string `json:"destAccount"` // card PAN for this rail — see orchestrator's RoutingEngine
	DestBic       string `json:"destBic"`
	Amount        string `json:"amount"`
	Currency      string `json:"currency"`
}

// SettlementEvent is published back onto payment.settlement.confirmed by every rail adapter.
type SettlementEvent struct {
	TransactionID string `json:"transactionId"`
	Rail          string `json:"rail"`
	Settled       bool   `json:"settled"`
	Reason        string `json:"reason,omitempty"`
}

// Iso8583Message is a simplified subset of an ISO 8583 financial transaction request (MTI 0200).
// See ../README.md "Nguồn spec" for the standard reference and exactly what's simplified here
// (this is nowhere near a full bitmap-encoded ISO 8583 message — it's a field-name-only Go struct
// covering the data elements a lab needs to reason about, not to wire-format).
type Iso8583Message struct {
	MTI  string // Message Type Indicator — "0200" = financial transaction request
	DE2  string // Primary Account Number (PAN) — the card number
	DE3  string // Processing Code (e.g. "000000" = purchase/goods and services)
	DE4  string // Amount, Transaction (in the card network's minor unit convention)
	DE11 string // System Trace Audit Number (STAN) — per-terminal sequence number
	DE37 string // Retrieval Reference Number (RRN) — used to match authorization to clearing later
	DE39 string // Response Code — set by SimulateAuthorization, "00" = approved
	DE49 string // Currency Code, Transaction (ISO 4217 numeric, simplified to alpha here)
}

func BuildIso8583Request(event RoutingEvent) Iso8583Message {
	return Iso8583Message{
		MTI:  "0200",
		DE2:  event.DestAccount,
		DE3:  "000000",
		DE4:  event.Amount,
		DE11: fmt.Sprintf("%06d", rand.Intn(1000000)),
		DE37: fmt.Sprintf("RRN%s", event.TransactionID[:min(9, len(event.TransactionID))]), // built-in min (Go 1.21+)
		DE49: event.Currency,
	}
}

// AuthorizationOutcome is what VisaNet would return as DE39. This lab collapses authorization and
// clearing/settlement into one event for simplicity — see ../README.md "Giới hạn cụ thể" for why a
// real card transaction is actually TWO separate phases (auth now, clearing/settlement T+1/T+2).
type AuthorizationOutcome struct {
	Approved     bool
	ResponseCode string
}

// SimulateAuthorization stands in for a VisaNet authorization round-trip — real-world card auth is
// sub-second, much faster than either NAPAS or SWIFT in this lab.
func SimulateAuthorization(msg Iso8583Message) AuthorizationOutcome {
	time.Sleep(time.Duration(100+rand.Intn(400)) * time.Millisecond)
	if rand.Intn(25) == 0 { // ~4% simulated decline rate (insufficient funds, fraud hold, etc.)
		return AuthorizationOutcome{Approved: false, ResponseCode: "05"} // "05" = Do Not Honor
	}
	return AuthorizationOutcome{Approved: true, ResponseCode: "00"}
}
