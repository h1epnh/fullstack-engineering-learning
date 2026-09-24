package main

import (
	"crypto/rand"
	"fmt"
	mathrand "math/rand"
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

// Pacs008Message is a simplified subset of the ISO 20022 pacs.008.001.xx
// (FIToFICustomerCreditTransfer) message tree — GroupHeader + one
// CreditTransferTransactionInformation. See ../README.md "Nguồn spec" for the schema reference and
// exactly what's simplified vs. a schema-valid pacs.008 document.
type Pacs008Message struct {
	// -- GroupHeader (GrpHdr) --
	MsgId   string    // GrpHdr/MsgId
	CreDtTm time.Time // GrpHdr/CreDtTm
	NbOfTxs int       // GrpHdr/NbOfTxs — always 1 in this lab (no batching)

	// -- CreditTransferTransactionInformation (CdtTrfTxInf) --
	InstrId    string // PmtId/InstrId
	EndToEndId string // PmtId/EndToEndId — the orchestrator's transactionId
	TxId       string // PmtId/TxId
	UETR       string // PmtId/UETR — Unique End-to-end Transaction Reference (UUIDv4 per SWIFT spec)

	SttlmAmount   string // IntrBkSttlmAmt (value)
	SttlmCurrency string // IntrBkSttlmAmt (Ccy attribute)

	DbtrAcct   string // Dbtr/DbtrAcct — debtor (sender) account
	CdtrAcct   string // Cdtr/CdtrAcct — creditor (beneficiary) account
	CdtrAgtBIC string // CdtrAgt/FinInstnId/BICFI — beneficiary bank's SWIFT BIC
}

func BuildPacs008(event RoutingEvent) Pacs008Message {
	txID := event.TransactionID
	return Pacs008Message{
		MsgId:         fmt.Sprintf("MSG-%s", txID),
		CreDtTm:       time.Now().UTC(),
		NbOfTxs:       1,
		InstrId:       fmt.Sprintf("INSTR-%s", txID),
		EndToEndId:    txID,
		TxId:          fmt.Sprintf("TX-%s", txID),
		UETR:          newUETR(),
		SttlmAmount:   event.Amount,
		SttlmCurrency: event.Currency,
		DbtrAcct:      event.SourceAccount,
		CdtrAcct:      event.DestAccount,
		CdtrAgtBIC:    event.DestBic,
	}
}

// newUETR generates a UUIDv4-shaped string. SWIFT requires a real RFC 4122 v4 UUID here; this is
// good enough for a lab (doesn't claim full RFC compliance in the version/variant bits).
func newUETR() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		// crypto/rand failing is exceptional; fall back to a clearly-fake value rather than crash.
		return "00000000-0000-4000-8000-000000000000"
	}
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}

// SettlementOutcome is what a real correspondent-bank settlement would eventually confirm.
type SettlementOutcome struct {
	Settled bool
	Reason  string
}

// SimulateCorrespondentSettlement stands in for the real, inherently async correspondent-banking
// settlement path. Unlike NAPAS (real-time, <10s), cross-border settlement is genuinely slow — the
// sleep here is scaled up accordingly, and the ACK this represents is NOT fund movement (see
// DESIGN.md section 3, step 6).
func SimulateCorrespondentSettlement(msg Pacs008Message) SettlementOutcome {
	time.Sleep(time.Duration(2000+mathrand.Intn(4000)) * time.Millisecond)
	if mathrand.Intn(10) == 0 { // ~10% simulated failure rate — cross-border has more failure modes
		return SettlementOutcome{Settled: false, Reason: "simulated correspondent bank rejection"}
	}
	return SettlementOutcome{Settled: true}
}
