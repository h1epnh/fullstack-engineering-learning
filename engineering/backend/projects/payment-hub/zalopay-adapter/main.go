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
	groupID := getenv("KAFKA_GROUP_ID", "zalopay-adapter")

	go serveHealth(getenv("HTTP_PORT", "8088"))

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

	log.Printf("zalopay-adapter listening on topic %q via %v, publishing settlements to %q",
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
	if event.Rail != "ZALOPAY" {
		return // not ours — other rail events land on the same topic in this lab's simple setup
	}

	amount, err := strconv.ParseFloat(event.Amount, 64)
	if err != nil {
		log.Printf("tx=%s: invalid amount %q: %v", event.TransactionID, event.Amount, err)
		return
	}

	req := BuildOrderRequest(event, int64(amount))
	// Deliberately not logging req.AppUser — it's the recipient's phone number. Same class of PII
	// leak already found and fixed in ledger-service.
	log.Printf("[ZALOPAY] built order app_trans_id=%s amount=%d", req.AppTransID, req.Amount)

	resp := SimulateOrderProcessing(req)
	settled := resp.ReturnCode == 1

	settlement := SettlementEvent{
		TransactionID: event.TransactionID,
		Rail:          "ZALOPAY",
		Settled:       settled,
	}
	if !settled {
		settlement.Reason = resp.ReturnMessage
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
		log.Printf("[ZALOPAY] tx=%s SETTLED return_code=%d", event.TransactionID, resp.ReturnCode)
	} else {
		log.Printf("[ZALOPAY] tx=%s FAILED return_code=%d message=%q", event.TransactionID, resp.ReturnCode, resp.ReturnMessage)
	}
}

func serveHealth(port string) {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	log.Printf("zalopay-adapter health endpoint on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Printf("health server stopped: %v", err)
	}
}
