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
	groupID := getenv("KAFKA_GROUP_ID", "visa-adapter")

	go serveHealth(getenv("HTTP_PORT", "8085"))

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

	log.Printf("visa-adapter listening on topic %q via %v, publishing settlements to %q",
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
	if event.Rail != "VISA" {
		return // not ours — other rail events land on the same topic in this lab's simple setup
	}

	msg := BuildIso8583Request(event)
	log.Printf("[VISA] built ISO 8583 MTI=%s rrn=%s tx=%s amount=%s %s",
		msg.MTI, msg.DE37, event.TransactionID, msg.DE4, msg.DE49)

	outcome := SimulateAuthorization(msg)

	settlement := SettlementEvent{
		TransactionID: event.TransactionID,
		Rail:          "VISA",
		Settled:       outcome.Approved,
	}
	if !outcome.Approved {
		settlement.Reason = "declined, response code " + outcome.ResponseCode
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

	if outcome.Approved {
		log.Printf("[VISA] tx=%s APPROVED", event.TransactionID)
	} else {
		log.Printf("[VISA] tx=%s DECLINED response_code=%s", event.TransactionID, outcome.ResponseCode)
	}
}

func serveHealth(port string) {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	log.Printf("visa-adapter health endpoint on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Printf("health server stopped: %v", err)
	}
}
