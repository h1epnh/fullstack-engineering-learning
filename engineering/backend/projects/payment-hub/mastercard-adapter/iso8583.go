package main

import (
	"fmt"
	"math/big"
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

// Iso8583Message — same standard as visa-adapter (both networks run ISO 8583 financial messages),
// deliberately kept as its own copy rather than a shared package: in a real integration, Visa and
// Mastercard each publish their own implementation guide with network-specific field usage on top
// of the base ISO 8583 standard, so treating them as "the same code" would be the wrong lesson.
// See ../README.md "Nguồn spec".
type Iso8583Message struct {
	MTI  string
	DE2  string // PAN
	DE3  string // Processing Code
	DE4  string // Amount, Transaction
	DE11 string // STAN
	DE37 string // RRN
	DE49 string // Currency Code, Transaction
}

func BuildIso8583Request(event RoutingEvent) Iso8583Message {
	return Iso8583Message{
		MTI:  "0200",
		DE2:  event.DestAccount,
		DE3:  "000000",
		DE4:  event.Amount,
		DE11: fmt.Sprintf("%06d", rand.Intn(1000000)),
		DE37: fmt.Sprintf("RRN%s", event.TransactionID[:min(9, len(event.TransactionID))]),
		DE49: event.Currency,
	}
}

// STIPFloorLimit: Mastercard's Stand-In Processing (STIP) authorizes on the issuer's behalf, using
// the issuer's pre-agreed rules, when the issuer cannot be reached in time. A common real-world
// STIP rule is a floor limit — approve small amounts outright, decline anything above it, since
// the network has no live balance/fraud check to fall back on. This is a genuinely
// Mastercard-branded resilience mechanism, not a generic "retry" — it's the network making a risk
// decision the issuer didn't get to make.
var STIPFloorLimit = big.NewFloat(2_000_000) // arbitrary lab value, in transaction currency units

type AuthorizationOutcome struct {
	Approved     bool
	ResponseCode string
	ViaSTIP      bool
}

// SimulateAuthorization models two paths: the normal issuer round-trip, and — roughly 1 in 10
// times — a simulated issuer-unreachable case that falls through to STIP's floor-limit rule
// instead of just failing outright. That fallback-with-a-rule (not fallback-with-nothing) is the
// point: compare to the plain circuit-breaker fallback in the Cracking Spring Microservices
// Interviews notes (docs/microservices) — STIP is a fallback with real decision logic behind it.
func SimulateAuthorization(msg Iso8583Message) AuthorizationOutcome {
	time.Sleep(time.Duration(100+rand.Intn(400)) * time.Millisecond)

	issuerUnreachable := rand.Intn(10) == 0
	if issuerUnreachable {
		amount, _, err := big.ParseFloat(msg.DE4, 10, 64, big.ToNearestEven)
		approved := err == nil && amount.Cmp(STIPFloorLimit) <= 0
		responseCode := "00"
		if !approved {
			responseCode = "05"
		}
		return AuthorizationOutcome{Approved: approved, ResponseCode: responseCode, ViaSTIP: true}
	}

	if rand.Intn(25) == 0 { // ~4% simulated decline rate on the normal issuer path
		return AuthorizationOutcome{Approved: false, ResponseCode: "05"}
	}
	return AuthorizationOutcome{Approved: true, ResponseCode: "00"}
}
