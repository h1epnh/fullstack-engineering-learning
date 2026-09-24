package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

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
	groupID := getenv("KAFKA_GROUP_ID", "napas-adapter")

	go serveHealth(getenv("HTTP_PORT", "8081"))

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

	log.Printf("napas-adapter listening on topic %q via %v, publishing settlements to %q",
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
		log.Printf("failed to decode routing event: %v", err)
		return
	}
	if event.Rail != "NAPAS" {
		return // not ours — SWIFT/other rail events land on the same topic in this lab's simple setup
	}

	napasMsg := BuildNapasMessage(event)
	log.Printf("[NAPAS] built message ref=%s tx=%s amount=%s %s",
		napasMsg.ReferenceCode, napasMsg.TransactionID, napasMsg.Amount, napasMsg.Currency)

	outcome := SimulateRailCall(napasMsg)

	settlement := SettlementEvent{
		TransactionID: event.TransactionID,
		Rail:          "NAPAS",
		Settled:       outcome.Settled,
		Reason:        outcome.Reason,
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

	if outcome.Settled {
		log.Printf("[NAPAS] tx=%s SETTLED", napasMsg.TransactionID)
	} else {
		log.Printf("[NAPAS] tx=%s FAILED reason=%q", napasMsg.TransactionID, outcome.Reason)
	}
}

func serveHealth(port string) {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	log.Printf("napas-adapter health endpoint on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Printf("health server stopped: %v", err)
	}
}
