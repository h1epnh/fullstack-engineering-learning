package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/segmentio/kafka-go"
)

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func main() {
	brokers := []string{getenv("KAFKA_BOOTSTRAP", "localhost:9092")}
	routingTopic := getenv("ROUTING_TOPIC", "payment.routing.requested")
	settlementTopic := getenv("SETTLEMENT_TOPIC", "payment.settlement.confirmed")
	groupID := getenv("KAFKA_GROUP_ID", "momo-adapter")

	go serveHealth(getenv("HTTP_PORT", "8087"))

	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: brokers,
		Topic:   routingTopic,
		GroupID: groupID,
	})
	defer reader.Close()

	writer := &kafka.Writer{
		Addr:     kafka.TCP(brokers...),
		Topic:    settlementTopic,
		Balancer: &kafka.LeastBytes{},
	}
	defer writer.Close()

	log.Printf("momo-adapter listening on topic %q via %v, publishing settlements to %q",
		routingTopic, brokers, settlementTopic)
	ctx := context.Background()
	for {
		message, err := reader.ReadMessage(ctx)
		if err != nil {
			log.Printf("kafka read error: %v", err)
			continue
		}
		handleMessage(ctx, message.Value, writer)
	}
}

func handleMessage(ctx context.Context, raw []byte, writer *kafka.Writer) {
	var event RoutingEvent
	if err := json.Unmarshal(raw, &event); err != nil {
		log.Printf("failed to decode routing event (%d bytes): %v", len(raw), err)
		return
	}
	if event.Rail != "MOMO" {
		return // not ours — other rail events land on the same topic in this lab's simple setup
	}

	amount, err := strconv.ParseFloat(event.Amount, 64)
	if err != nil {
		log.Printf("tx=%s: invalid amount %q: %v", event.TransactionID, event.Amount, err)
		return
	}

	req, err := BuildDisbursementRequest(event, int64(amount))
	if err != nil {
		log.Printf("tx=%s: failed to build disbursement request: %v", event.TransactionID, err)
		return
	}
	// Deliberately not logging req.DisbursementMethod — it embeds the recipient's phone number
	// (walletId). Same class of PII leak already found and fixed in ledger-service.
	log.Printf("[MOMO] built disbursement request orderId=%s requestId=%s amount=%d",
		req.OrderID, req.RequestID, req.Amount)

	resp := SimulateDisbursement(req)
	settled := resp.ResultCode == 0

	settlement := SettlementEvent{
		TransactionID: event.TransactionID,
		Rail:          "MOMO",
		Settled:       settled,
	}
	if !settled {
		settlement.Reason = resp.Message
	}
	payload, err := json.Marshal(settlement)
	if err != nil {
		log.Printf("failed to marshal settlement event: %v", err)
		return
	}
	if err := writer.WriteMessages(ctx, kafka.Message{Key: []byte(event.TransactionID), Value: payload}); err != nil {
		log.Printf("failed to publish settlement event for tx=%s: %v", event.TransactionID, err)
		return
	}

	if settled {
		log.Printf("[MOMO] tx=%s SETTLED resultCode=%d", event.TransactionID, resp.ResultCode)
	} else {
		log.Printf("[MOMO] tx=%s FAILED resultCode=%d message=%q", event.TransactionID, resp.ResultCode, resp.Message)
	}
}

func serveHealth(port string) {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	log.Printf("momo-adapter health endpoint on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Printf("health server stopped: %v", err)
	}
}
