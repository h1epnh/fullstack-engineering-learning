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
	groupID := getenv("KAFKA_GROUP_ID", "mastercard-adapter")

	go serveHealth(getenv("HTTP_PORT", "8086"))

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

	log.Printf("mastercard-adapter listening on topic %q via %v, publishing settlements to %q",
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
	if event.Rail != "MASTERCARD" {
		return // not ours — other rail events land on the same topic in this lab's simple setup
	}

	msg := BuildIso8583Request(event)
	log.Printf("[MASTERCARD] built ISO 8583 MTI=%s rrn=%s tx=%s amount=%s %s",
		msg.MTI, msg.DE37, event.TransactionID, msg.DE4, msg.DE49)

	outcome := SimulateAuthorization(msg)

	settlement := SettlementEvent{
		TransactionID: event.TransactionID,
		Rail:          "MASTERCARD",
		Settled:       outcome.Approved,
	}
	if !outcome.Approved {
		settlement.Reason = "declined, response code " + outcome.ResponseCode
		if outcome.ViaSTIP {
			settlement.Reason += " (via Stand-In Processing, issuer unreachable)"
		}
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

	stipNote := ""
	if outcome.ViaSTIP {
		stipNote = " via_stip=true"
	}
	if outcome.Approved {
		log.Printf("[MASTERCARD] tx=%s APPROVED%s", event.TransactionID, stipNote)
	} else {
		log.Printf("[MASTERCARD] tx=%s DECLINED response_code=%s%s", event.TransactionID, outcome.ResponseCode, stipNote)
	}
}

func serveHealth(port string) {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	log.Printf("mastercard-adapter health endpoint on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Printf("health server stopped: %v", err)
	}
}
