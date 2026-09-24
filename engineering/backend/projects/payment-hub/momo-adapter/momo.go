package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/rand"
	"sort"
	"strings"
	"time"
)

// RoutingEvent mirrors the outbox payload published by the orchestrator
// (see orchestrator/.../service/TransactionWriter.persistRouted).
type RoutingEvent struct {
	TransactionID string `json:"transactionId"`
	Rail          string `json:"rail"`
	SourceAccount string `json:"sourceAccount"`
	DestAccount   string `json:"destAccount"` // VN phone number = MoMo walletId for this rail
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

// lab-only fake credentials — a real integration gets these from a signed contract with MoMo,
// never hardcoded like this.
const (
	fakePartnerCode = "LAB_PARTNER_CODE"
	fakeAccessKey   = "lab-access-key"
	fakeSecretKey   = "lab-secret-key-do-not-use-in-production"
)

// WalletDisbursementMethod is the wallet-specific payload MoMo expects inside the (in reality
// RSA-encrypted) disbursementMethod field. See ../README.md "Nguồn spec" for why this lab sends it
// as plain JSON instead of actually RSA-encrypting it.
type WalletDisbursementMethod struct {
	WalletID   string `json:"walletId"`
	WalletName string `json:"walletName"`
}

// DisbursementRequest matches MoMo's Single Disbursement API (v2) request fields exactly, per
// https://developers.momo.vn/v3/docs/payment/api/disbursement-v2/ — field names, types, and the
// requestType enum value are taken directly from that page, not invented for this lab.
type DisbursementRequest struct {
	PartnerCode        string `json:"partnerCode"`
	OrderID            string `json:"orderId"`
	Amount             int64  `json:"amount"`
	RequestID          string `json:"requestId"`
	RequestType        string `json:"requestType"` // "disburseToWallet" for wallet payouts
	DisbursementMethod string `json:"disbursementMethod"`
	ExtraData          string `json:"extraData"`
	OrderInfo          string `json:"orderInfo"`
	Lang               string `json:"lang"`
	Signature          string `json:"signature"`
}

func BuildDisbursementRequest(event RoutingEvent, amount int64) (DisbursementRequest, error) {
	methodPayload, err := json.Marshal(WalletDisbursementMethod{
		WalletID:   event.DestAccount,
		WalletName: "recipient", // real integrations resolve/display an actual name; lab has none
	})
	if err != nil {
		return DisbursementRequest{}, err
	}

	req := DisbursementRequest{
		PartnerCode:        fakePartnerCode,
		OrderID:            event.TransactionID,
		Amount:             amount,
		RequestID:          fmt.Sprintf("req-%s", event.TransactionID),
		RequestType:        "disburseToWallet",
		DisbursementMethod: string(methodPayload),
		ExtraData:          "",
		OrderInfo:          "payment-hub lab disbursement",
		Lang:               "en",
	}
	req.Signature = computeSignature(req)
	return req, nil
}

// computeSignature reproduces MoMo's documented signature formula exactly: sort the signed fields
// alphabetically by key, concatenate as "key=value&key=value...", HMAC-SHA256 with the secret key.
// Field list and order (accessKey, amount, disbursementMethod, extraData, orderId, orderInfo,
// partnerCode, requestId, requestType) are copied verbatim from MoMo's docs — getting this order
// wrong is the single most common integration bug with MoMo's API.
func computeSignature(req DisbursementRequest) string {
	fields := map[string]string{
		"accessKey":          fakeAccessKey,
		"amount":             fmt.Sprintf("%d", req.Amount),
		"disbursementMethod": req.DisbursementMethod,
		"extraData":          req.ExtraData,
		"orderId":            req.OrderID,
		"orderInfo":          req.OrderInfo,
		"partnerCode":        req.PartnerCode,
		"requestId":          req.RequestID,
		"requestType":        req.RequestType,
	}
	keys := make([]string, 0, len(fields))
	for k := range fields {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	pairs := make([]string, 0, len(keys))
	for _, k := range keys {
		pairs = append(pairs, fmt.Sprintf("%s=%s", k, fields[k]))
	}
	rawSignature := strings.Join(pairs, "&")

	mac := hmac.New(sha256.New, []byte(fakeSecretKey))
	mac.Write([]byte(rawSignature))
	return hex.EncodeToString(mac.Sum(nil))
}

// DisbursementResponse mirrors MoMo's documented response fields for the Single Disbursement API.
type DisbursementResponse struct {
	PartnerCode  string `json:"partnerCode"`
	OrderID      string `json:"orderId"`
	RequestID    string `json:"requestId"`
	Amount       int64  `json:"amount"`
	TransID      int64  `json:"transId"`
	ResponseTime int64  `json:"responseTime"`
	ResultCode   int    `json:"resultCode"` // 0 = success, non-zero = failure (MoMo convention)
	Message      string `json:"message"`
}

// SimulateDisbursement stands in for the real MoMo API round-trip. MoMo requires a minimum 30s
// client timeout per their docs, but actual disbursement is normally much faster than that ceiling
// — modeled here as comparable to NAPAS (near-instant, wallet-to-wallet-adjacent).
func SimulateDisbursement(req DisbursementRequest) DisbursementResponse {
	time.Sleep(time.Duration(300+rand.Intn(1200)) * time.Millisecond)

	resp := DisbursementResponse{
		PartnerCode:  req.PartnerCode,
		OrderID:      req.OrderID,
		RequestID:    req.RequestID,
		Amount:       req.Amount,
		TransID:      rand.Int63n(1_000_000_000),
		ResponseTime: time.Now().UnixMilli(),
	}
	if rand.Intn(15) == 0 { // ~7% simulated failure (wallet not found/KYC hold/insufficient balance)
		resp.ResultCode = 1000
		resp.Message = "disbursement rejected"
		return resp
	}
	resp.ResultCode = 0
	resp.Message = "Successful."
	return resp
}
