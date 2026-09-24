package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/rand"
	"strconv"
	"time"
)

// RoutingEvent mirrors the outbox payload published by the orchestrator
// (see orchestrator/.../service/TransactionWriter.persistRouted).
type RoutingEvent struct {
	TransactionID string `json:"transactionId"`
	Rail          string `json:"rail"`
	SourceAccount string `json:"sourceAccount"`
	DestAccount   string `json:"destAccount"` // VN phone number = ZaloPay app_user for this rail
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

// lab-only fake credentials — a real integration gets these from ZaloPay at merchant registration.
const (
	fakeAppID  = 1727 // ZaloPay's own docs use this exact sample app_id
	fakeMacKey = "lab-mac-key-do-not-use-in-production"
)

// OrderRequest matches the field set from ZaloPay's official "Create Order" API — app_id,
// app_user, app_trans_id, app_time, amount, item, embed_data, description, mac — verified from
// ZaloPay-APIs-Integration-Document.pdf (see ../README.md "Nguồn spec"). ZaloPay's
// disbursement-specific document wasn't reachable when this was written; this adapts the verified
// Order+Callback field/MAC pattern to a payout direction rather than confirming against a
// disbursement-specific spec — see the README for exactly what that means.
type OrderRequest struct {
	AppID       int    `json:"app_id"`
	AppUser     string `json:"app_user"`
	AppTransID  string `json:"app_trans_id"`
	AppTime     int64  `json:"app_time"`
	Amount      int64  `json:"amount"`
	Item        string `json:"item"`
	EmbedData   string `json:"embed_data"`
	Description string `json:"description"`
	Mac         string `json:"mac"`
}

func BuildOrderRequest(event RoutingEvent, amount int64) OrderRequest {
	appTime := time.Now().UnixMilli()
	appTransID := fmt.Sprintf("%s_%s", time.Now().Format("060102"), event.TransactionID)

	req := OrderRequest{
		AppID:       fakeAppID,
		AppUser:     event.DestAccount,
		AppTransID:  appTransID,
		AppTime:     appTime,
		Amount:      amount,
		Item:        "[]",
		EmbedData:   "{}",
		Description: fmt.Sprintf("payment-hub lab disbursement #%s", event.TransactionID),
	}
	req.Mac = computeMac(req)
	return req
}

// computeMac reproduces ZaloPay's documented formula exactly:
// mac = HMAC(hmac_algorithm, mackey, hmacinput)
// hmacinput = app_id + "|" + app_trans_id + "|" + app_user + "|" + amount + "|" + app_time + "|" + embed_data + "|" + item
// (ZaloPay's default hmac_algorithm is HmacSHA256.) Order of concatenation matters — it is NOT
// alphabetical like MoMo's, it's the field order ZaloPay's docs list explicitly.
func computeMac(req OrderRequest) string {
	raw := fmt.Sprintf("%d|%s|%s|%d|%d|%s|%s",
		req.AppID, req.AppTransID, req.AppUser, req.Amount, req.AppTime, req.EmbedData, req.Item)

	mac := hmac.New(sha256.New, []byte(fakeMacKey))
	mac.Write([]byte(raw))
	return hex.EncodeToString(mac.Sum(nil))
}

// OrderResponse mirrors ZaloPay's documented response fields for order creation.
type OrderResponse struct {
	ReturnCode       int    `json:"return_code"` // 1 = success, 2 = fail (per ZaloPay docs)
	ReturnMessage    string `json:"return_message"`
	SubReturnCode    int    `json:"sub_return_code"`
	SubReturnMessage string `json:"sub_return_message"`
	ZpTransToken     string `json:"zp_trans_token"`
}

// SimulateOrderProcessing stands in for the real ZaloPay round-trip. ZaloPay's docs note orders
// are valid for 15 minutes and recommend a status-poll fallback if the callback is missed — this
// lab collapses that into one simulated round-trip (see ../README.md "Giới hạn cụ thể").
func SimulateOrderProcessing(req OrderRequest) OrderResponse {
	time.Sleep(time.Duration(300+rand.Intn(1200)) * time.Millisecond)

	resp := OrderResponse{ZpTransToken: strconv.FormatInt(rand.Int63n(1_000_000_000_000), 10)}
	if rand.Intn(15) == 0 { // ~7% simulated failure (wallet not found/KYC hold/insufficient balance)
		resp.ReturnCode = 2
		resp.ReturnMessage = "Giao dịch thất bại"
		return resp
	}
	resp.ReturnCode = 1
	resp.ReturnMessage = "Giao dịch thành công"
	return resp
}
