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
	DestAccount   string `json:"destAccount"`
	DestBic       string `json:"destBic"`
	Amount        string `json:"amount"`
	Currency      string `json:"currency"`
}

// SettlementEvent is published back onto payment.settlement.confirmed by both rail adapters. The
// orchestrator consumes it to move ROUTED -> SETTLED/FAILED; ledger-service consumes it to
// finalize (or reverse) the provisional double-entry it recorded when the transaction was routed.
type SettlementEvent struct {
	TransactionID string `json:"transactionId"`
	Rail          string `json:"rail"`
	Settled       bool   `json:"settled"`
	Reason        string `json:"reason,omitempty"`
}

// NapasMessage is a best-effort approximation of the fields NAPAS FastFund 247 needs, built from
// public end-user documentation (see ../README.md "Nguồn spec") — NOT the real proprietary NAPAS
// interbank message format, which is only issued to member banks under NDA.
type NapasMessage struct {
	TransactionID string
	SourceAccount string
	DestAccount   string
	Amount        string
	Currency      string
	ReferenceCode string
	RequestedAt   time.Time
}

func BuildNapasMessage(event RoutingEvent) NapasMessage {
	return NapasMessage{
		TransactionID: event.TransactionID,
		SourceAccount: event.SourceAccount,
		DestAccount:   event.DestAccount,
		Amount:        event.Amount,
		Currency:      event.Currency,
		ReferenceCode: fmt.Sprintf("NAPAS247-%s", event.TransactionID),
		RequestedAt:   time.Now(),
	}
}

// SettlementOutcome is what a real NAPAS 247 call would eventually confirm or reject.
type SettlementOutcome struct {
	Settled bool
	Reason  string
}

// SimulateRailCall stands in for an actual NAPAS network round-trip: NAPAS 247 is designed to be
// real-time (<10s), so this sleeps briefly rather than the long async wait modeled for SWIFT.
func SimulateRailCall(msg NapasMessage) SettlementOutcome {
	time.Sleep(time.Duration(500+rand.Intn(1500)) * time.Millisecond)
	if rand.Intn(20) == 0 { // ~5% simulated failure rate, for exercising the failure path
		return SettlementOutcome{Settled: false, Reason: "simulated NAPAS timeout"}
	}
	return SettlementOutcome{Settled: true}
}
