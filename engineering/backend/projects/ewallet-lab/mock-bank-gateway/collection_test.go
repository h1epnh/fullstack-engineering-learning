package main

import "testing"

// Cross-language fixed vector. These exact values are also asserted in the Java test
// IpnSignatureVerifierTests (topup-service) — the two implementations live in different
// languages and different repos, so a shared constant is the only thing that actually PROVES the
// Go gateway signs what the Java verifier recomputes. If either side changes the canonical string
// (field set, sort order, separator, empty-value handling), one of the two tests fails.
//
// The expected digest was computed independently with Python's hmac/hashlib:
//
//	raw = "accessKey=test-access-key&amount=50000&extraData=&message=msg&orderId=ord-1" +
//	      "&orderInfo=info&orderType=lab&partnerCode=P&payType=lab&requestId=req-1" +
//	      "&responseTime=1700000000000&resultCode=0&transId=99"
//	hmac_sha256(raw, "test-secret-not-a-real-one") = 8d7d3c6d...072f
const (
	vectorAccessKey    = "test-access-key"
	vectorSecret       = "test-secret-not-a-real-one"
	vectorOrderID      = "ord-1"
	vectorRequestID    = "req-1"
	vectorAmount       = int64(50000)
	vectorOrderInfo    = "info"
	vectorOrderType    = "lab"
	vectorPayType      = "lab"
	vectorMessage      = "msg"
	vectorTransID      = int64(99)
	vectorResultCode   = 0
	vectorResponseTime = int64(1700000000000)
	vectorSignature    = "8d7d3c6d4764b21272200f1b6bec99bd2398052e83e0c19502463c0b7232072f"
)

func vectorPayload() IpnPayload {
	return IpnPayload{
		PartnerCode:  "P",
		OrderID:      vectorOrderID,
		RequestID:    vectorRequestID,
		Amount:       vectorAmount,
		OrderInfo:    vectorOrderInfo,
		OrderType:    vectorOrderType,
		TransID:      vectorTransID,
		ResultCode:   vectorResultCode,
		Message:      vectorMessage,
		PayType:      vectorPayType,
		ResponseTime: vectorResponseTime,
		ExtraData:    "",
	}
}

func TestIpnSignatureMatchesSharedCrossLanguageVector(t *testing.T) {
	accessKey = vectorAccessKey
	p := vectorPayload()
	got := hmacSignature(p.signedFields(), vectorSecret)
	if got != vectorSignature {
		t.Fatalf("IPN signature mismatch:\n got  %s\n want %s", got, vectorSignature)
	}
}

// The signed field set must be exactly the 13 documented fields — no more (which would make the
// Java side disagree) and no fewer (the old bug: the gateway signed only 6 fields, so topup-service
// — which verifies the full set — rejected every IPN as forged).
func TestSignedFieldsCoverExactlyThe13DocumentedFields(t *testing.T) {
	accessKey = vectorAccessKey
	fields := vectorPayload().signedFields()
	want := []string{
		"accessKey", "amount", "extraData", "message", "orderId", "orderInfo", "orderType",
		"partnerCode", "payType", "requestId", "responseTime", "resultCode", "transId",
	}
	if len(fields) != len(want) {
		t.Fatalf("expected %d signed fields, got %d: %v", len(want), len(fields), fields)
	}
	for _, k := range want {
		if _, ok := fields[k]; !ok {
			t.Fatalf("signed field %q missing", k)
		}
	}
}

// Every field is always present, even when empty — a missing key and an empty value must produce
// the SAME canonical string on both sides, otherwise a legit IPN with an empty extraData would be
// rejected.
func TestSignedFieldsIncludeEmptyValuesRatherThanOmitThem(t *testing.T) {
	accessKey = vectorAccessKey
	fields := vectorPayload().signedFields()
	if v, ok := fields["extraData"]; !ok || v != "" {
		t.Fatalf("expected extraData present and empty, got %q (present=%v)", v, ok)
	}
}

// The create-request signature (Collection Link) is a DIFFERENT field set than the IPN one —
// make sure the change to the IPN path did not disturb it. The expected digest below was computed
// independently with Python's hmac over:
//
//	"accessKey=test-access-key&amount=50000&extraData=&ipnUrl=http://topup-service:8092/ipn/topup" +
//	"&orderId=ord-1&orderInfo=info&partnerCode=P&redirectUrl=&requestId=req-1" +
//	"&requestType=payWithMethod"
func TestCollectionRequestSignatureIsUnchangedByTheIpnChange(t *testing.T) {
	accessKey = vectorAccessKey
	fields := map[string]string{
		"accessKey":   vectorAccessKey,
		"amount":      "50000",
		"extraData":   "",
		"ipnUrl":      "http://topup-service:8092/ipn/topup",
		"orderId":     vectorOrderID,
		"orderInfo":   vectorOrderInfo,
		"partnerCode": "P",
		"redirectUrl": "",
		"requestId":   vectorRequestID,
		"requestType": "payWithMethod",
	}
	const want = "a92f938906bfd8a2a6ca17b081597b33335efc916f9b18dc2c2006e7e485d3af"
	if got := hmacSignature(fields, vectorSecret); got != want {
		t.Fatalf("collection signature mismatch:\n got  %s\n want %s", got, want)
	}
}

// A tampered field must change the signature — this is what makes the verifier meaningful.
func TestTamperingWithAnySignedFieldBreaksTheSignature(t *testing.T) {
	accessKey = vectorAccessKey
	base := hmacSignature(vectorPayload().signedFields(), vectorSecret)

	for _, mutate := range []struct {
		name string
		fn   func(p *IpnPayload)
	}{
		{"amount", func(p *IpnPayload) { p.Amount = 50001 }},
		{"orderId", func(p *IpnPayload) { p.OrderID = "ord-2" }},
		{"resultCode", func(p *IpnPayload) { p.ResultCode = 1000 }},
		{"transId", func(p *IpnPayload) { p.TransID = 100 }},
		{"message", func(p *IpnPayload) { p.Message = "tampered" }},
		{"responseTime", func(p *IpnPayload) { p.ResponseTime = vectorResponseTime + 1 }},
	} {
		p := vectorPayload()
		mutate.fn(&p)
		if got := hmacSignature(p.signedFields(), vectorSecret); got == base {
			t.Fatalf("mutating %s did not change the signature", mutate.name)
		}
	}
}

// A wrong secret must not validate.
func TestWrongSecretProducesDifferentSignature(t *testing.T) {
	accessKey = vectorAccessKey
	if hmacSignature(vectorPayload().signedFields(), "attacker-guess") == vectorSignature {
		t.Fatal("signature must not validate under a different secret")
	}
}
