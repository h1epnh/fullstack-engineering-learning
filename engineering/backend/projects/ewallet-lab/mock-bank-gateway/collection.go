package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sort"
	"strings"
	"time"
)

// Credentials come from the environment (issue #52) — the same BANK_GATEWAY_ACCESS_KEY /
// BANK_GATEWAY_SECRET_KEY pair topup-service reads. They are lab-only fake values, but they are
// NOT compiled in: a hardcoded secret in the image would leak to anyone who pulls it, and the
// whole point of this ticket is that the shared secret is configuration, not code. The gateway
// refuses to start without them, exactly like topup-service refuses to start without
// BANK_GATEWAY_SECRET_KEY (see its application.yml).
//
// A real bank would look the accessKey/secretKey up server-side from partnerCode and never share
// secretKey with the caller at all (only accessKey, used just to namespace which merchant this is).
var (
	accessKey string
	secretKey string
)

// ipnOrderType / ipnPayType are LAB-DEFINED values — MoMo's real IPN carries its own enums for
// these two fields. The signature covers them (they are part of the 13 signed fields), so both
// sides must agree on the values; they are not claimed to be MoMo's.
const (
	ipnOrderType = "topup"
	ipnPayType   = "bankcard"
)

// CollectionRequest mirrors MoMo's real Collection Link request fields — see
// ../topup-service/src/.../service/MomoStyleSignature.java for the verified source and the exact
// signature formula this reproduces.
type CollectionRequest struct {
	PartnerCode string `json:"partnerCode"`
	RequestID   string `json:"requestId"`
	Amount      int64  `json:"amount"`
	OrderID     string `json:"orderId"`
	OrderInfo   string `json:"orderInfo"`
	RedirectURL string `json:"redirectUrl"`
	IpnURL      string `json:"ipnUrl"`
	RequestType string `json:"requestType"`
	ExtraData   string `json:"extraData"`
	Signature   string `json:"signature"`
}

type CollectionResponse struct {
	PartnerCode  string `json:"partnerCode"`
	RequestID    string `json:"requestId"`
	OrderID      string `json:"orderId"`
	Amount       int64  `json:"amount"`
	ResponseTime int64  `json:"responseTime"`
	Message      string `json:"message"`
	ResultCode   int    `json:"resultCode"`
	PayURL       string `json:"payUrl"`
	ShortLink    string `json:"shortLink"`
}

// IpnPayload mirrors MoMo's real IPN fields (see topup-service's IpnSignatureVerifier — the field
// list and the signature formula there were verified from MoMo's official docs:
// https://developers.momo.vn/v3/docs/payment/api/collection-link/, section "Processing payment
// result"). The 13 SIGNED fields are all present here; `signature` itself is the 14th, unsigned.
//
// The values placed into orderType/payType are LAB-DEFINED (MoMo's own enums are not reproduced
// here), but they ARE covered by the signature, so topup-service must sign the same values —
// it does, because it re-signs whatever arrived in the payload rather than assuming constants.
type IpnPayload struct {
	PartnerCode  string `json:"partnerCode"`
	OrderID      string `json:"orderId"`
	RequestID    string `json:"requestId"`
	Amount       int64  `json:"amount"`
	OrderInfo    string `json:"orderInfo"`
	OrderType    string `json:"orderType"`
	TransID      int64  `json:"transId"`
	ResultCode   int    `json:"resultCode"`
	Message      string `json:"message"`
	PayType      string `json:"payType"`
	ResponseTime int64  `json:"responseTime"`
	ExtraData    string `json:"extraData"`
	Signature    string `json:"signature"`
}

// signedFields returns the canonical signed string of the 13 fields MoMo documents, in the same
// order/format the Java side uses (see IpnSignatureVerifier#signedFields): the key set is
// FIXED — every field is always present, empty strings included — so a missing field can never be
// silently treated as "not signed".
func (p IpnPayload) signedFields() map[string]string {
	return map[string]string{
		"accessKey":    accessKey,
		"amount":       fmt.Sprintf("%d", p.Amount),
		"extraData":    p.ExtraData,
		"message":      p.Message,
		"orderId":      p.OrderID,
		"orderInfo":    p.OrderInfo,
		"orderType":    p.OrderType,
		"partnerCode":  p.PartnerCode,
		"payType":      p.PayType,
		"requestId":    p.RequestID,
		"responseTime": fmt.Sprintf("%d", p.ResponseTime),
		"resultCode":   fmt.Sprintf("%d", p.ResultCode),
		"transId":      fmt.Sprintf("%d", p.TransID),
	}
}

func verifySignature(req CollectionRequest) bool {
	fields := map[string]string{
		"accessKey":   accessKey,
		"amount":      fmt.Sprintf("%d", req.Amount),
		"extraData":   req.ExtraData,
		"ipnUrl":      req.IpnURL,
		"orderId":     req.OrderID,
		"orderInfo":   req.OrderInfo,
		"partnerCode": req.PartnerCode,
		"redirectUrl": req.RedirectURL,
		"requestId":   req.RequestID,
		"requestType": req.RequestType,
	}
	expected := hmacSignature(fields, secretKey)
	return hmac.Equal([]byte(expected), []byte(req.Signature))
}

// hmacSignature builds the canonical string (keys sorted a-z, "k=v" joined by "&") and returns
// its HMAC-SHA256 hex digest. The secret is a parameter (not a package global) so the signing
// primitive is pure and directly testable with a fixed vector.
func hmacSignature(fields map[string]string, secret string) string {
	keys := make([]string, 0, len(fields))
	for k := range fields {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	pairs := make([]string, 0, len(keys))
	for _, k := range keys {
		pairs = append(pairs, fmt.Sprintf("%s=%s", k, fields[k]))
	}
	raw := strings.Join(pairs, "&")

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(raw))
	return hex.EncodeToString(mac.Sum(nil))
}

// simulateAndSendIPN plays "the bank actually processing the transfer" — real bank processing is
// not instant, so this always responds to the initial create-call first, then calls back later.
func simulateAndSendIPN(req CollectionRequest) {
	time.Sleep(time.Duration(500+rand.Intn(2000)) * time.Millisecond)

	resultCode := 0
	message := "Successful."
	if rand.Intn(15) == 0 { // ~7% simulated failure — insufficient funds, linked account issue, etc.
		resultCode = 1000
		message = "Transfer failed"
	}

	ipn := IpnPayload{
		PartnerCode:  req.PartnerCode,
		OrderID:      req.OrderID,
		RequestID:    req.RequestID,
		Amount:       req.Amount,
		OrderInfo:    req.OrderInfo,
		OrderType:    ipnOrderType,
		TransID:      rand.Int63n(1_000_000_000),
		ResultCode:   resultCode,
		Message:      message,
		PayType:      ipnPayType,
		ResponseTime: time.Now().UnixMilli(),
		ExtraData:    req.ExtraData,
	}
	// Issue #52: sign ALL 13 documented fields, not a 6-field subset — topup-service re-computes
	// the signature over the full set and rejects the IPN if it does not match.
	ipn.Signature = hmacSignature(ipn.signedFields(), secretKey)

	body, err := json.Marshal(ipn)
	if err != nil {
		return
	}
	// Best-effort — a real bank would retry with backoff on failure. Not modeled here.
	resp, err := http.Post(req.IpnURL, "application/json", bytes.NewReader(body))
	if err != nil {
		log.Printf("orderId=%s: failed to send IPN to %s: %v", req.OrderID, req.IpnURL, err)
		return
	}
	defer resp.Body.Close()
	// Log the status so a REJECTED IPN is visible in the gateway log. topup-service answers 401 when
	// the signature does not match (or the IPN is outside the replay window) and 400 when the amount
	// does not match — without this line, a signature mismatch looks exactly like a success from the
	// gateway's side, and the top-up silently stays PENDING.
	if resp.StatusCode != http.StatusNoContent {
		log.Printf("orderId=%s: IPN REJECTED by %s with HTTP %d (signature/amount/replay mismatch?)",
			req.OrderID, req.IpnURL, resp.StatusCode)
		return
	}
	log.Printf("orderId=%s: IPN accepted with HTTP %d", req.OrderID, resp.StatusCode)
}
