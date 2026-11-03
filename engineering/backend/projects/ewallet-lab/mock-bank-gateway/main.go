package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// requireEnv reads a mandatory env var and exits if it is missing/blank. Issue #52: the shared
// secret is CONFIGURATION, never a compiled-in constant — so a missing value must stop the process
// loudly instead of silently falling back to a well-known default (which would be a hardcoded
// secret all over again, and would silently break the IPN signature handshake instead of failing
// at startup where the operator can see it).
func requireEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("%s must be set (issue #52: no default secret — set it via env/Secret)", key)
	}
	return v
}

func main() {
	accessKey = requireEnv("BANK_GATEWAY_ACCESS_KEY")
	secretKey = requireEnv("BANK_GATEWAY_SECRET_KEY")

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	mux.HandleFunc("/v2/gateway/api/create", handleCreate)

	port := getenv("HTTP_PORT", "8093")
	log.Printf("mock-bank-gateway listening on :%s (accessKey=%s)", port, accessKey)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}

func handleCreate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req CollectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if !verifySignature(req) {
		log.Printf("orderId=%s: signature verification failed", req.OrderID)
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(CollectionResponse{
			PartnerCode: req.PartnerCode, RequestID: req.RequestID, OrderID: req.OrderID,
			ResultCode: 1001, Message: "Invalid signature", ResponseTime: time.Now().UnixMilli(),
		})
		return
	}

	// Fire the IPN asynchronously — the HTTP response below is the immediate ack (step 3 in
	// DESIGN.md), the IPN (step 4) is what actually confirms the transfer, later.
	go simulateAndSendIPN(req)

	resp := CollectionResponse{
		PartnerCode:  req.PartnerCode,
		RequestID:    req.RequestID,
		OrderID:      req.OrderID,
		Amount:       req.Amount,
		ResponseTime: time.Now().UnixMilli(),
		Message:      "Successful.",
		ResultCode:   0,
		PayURL:       "https://mock-bank.local/pay/" + req.OrderID,
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
	log.Printf("orderId=%s: accepted, IPN will follow asynchronously", req.OrderID)
}
