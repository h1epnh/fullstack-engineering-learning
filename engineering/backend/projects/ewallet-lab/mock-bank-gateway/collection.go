package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"sort"
	"strings"
	"time"
)

// lab-only fake credentials, must match topup-service's BankGatewayClient exactly — a real bank
// would look up the accessKey/secretKey server-side from partnerCode, never share secretKey with
// the caller at all (only accessKey, used just to namespace which merchant this is).
const fakeSecretKey = "lab-secret-key-do-not-use-in-production"
const fakeAccessKey = "lab-access-key"

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

// IpnPayload mirrors MoMo's real IPN fields (see topup-service's IpnController — the IPN-specific
// signature formula was not confirmed from the docs fetched while building this, so this lab
// computes it with the same style as the create-request signature rather than inventing a
// different unverified one; see README.md "Giới hạn cụ thể").
type IpnPayload struct {
	PartnerCode  string `json:"partnerCode"`
	OrderID      string `json:"orderId"`
	RequestID    string `json:"requestId"`
	Amount       int64  `json:"amount"`
	TransID      int64  `json:"transId"`
	ResultCode   int    `json:"resultCode"`
	Message      string `json:"message"`
	ResponseTime int64  `json:"responseTime"`
	Signature    string `json:"signature"`
}

func verifySignature(req CollectionRequest) bool {
	fields := map[string]string{
		"accessKey":   fakeAccessKey,
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
	expected := hmacSignature(fields)
	return hmac.Equal([]byte(expected), []byte(req.Signature))
}

func hmacSignature(fields map[string]string) string {
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

	mac := hmac.New(sha256.New, []byte(fakeSecretKey))
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
		TransID:      rand.Int63n(1_000_000_000),
		ResultCode:   resultCode,
		Message:      message,
		ResponseTime: time.Now().UnixMilli(),
	}
	ipn.Signature = hmacSignature(map[string]string{
		"accessKey":   fakeAccessKey,
		"amount":      fmt.Sprintf("%d", ipn.Amount),
		"orderId":     ipn.OrderID,
		"partnerCode": ipn.PartnerCode,
		"requestId":   ipn.RequestID,
		"resultCode":  fmt.Sprintf("%d", ipn.ResultCode),
	})

	body, err := json.Marshal(ipn)
	if err != nil {
		return
	}
	// Best-effort — a real bank would retry with backoff on failure. Not modeled here.
	resp, err := http.Post(req.IpnURL, "application/json", bytes.NewReader(body))
	if err == nil {
		resp.Body.Close()
	}
}
