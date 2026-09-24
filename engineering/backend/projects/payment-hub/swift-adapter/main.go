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
	groupID := getenv("KAFKA_GROUP_ID", "swift-adapter")

	go serveHealth(getenv("HTTP_PORT", "8082"))

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

	log.Printf("swift-adapter listening on topic %q via %v, publishing settlements to %q",
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
	if event.Rail != "SWIFT" {
		return // not ours — NAPAS/other rail events land on the same topic in this lab's simple setup
	}

	msg := BuildPacs008(event)
	log.Printf("[SWIFT] built pacs.008 uetr=%s tx=%s amount=%s %s -> BIC=%s",
		msg.UETR, msg.EndToEndId, msg.SttlmAmount, msg.SttlmCurrency, msg.CdtrAgtBIC)

	// This ACK only means "correspondent bank accepted the message" — see DESIGN.md section 3,
	// step 6. It is deliberately reported as a separate async event, not folded into the initial
	// routing response, because real cross-border settlement can take hours.
	outcome := SimulateCorrespondentSettlement(msg)

	settlement := SettlementEvent{
		TransactionID: event.TransactionID,
		Rail:          "SWIFT",
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
		log.Printf("[SWIFT] tx=%s SETTLED", event.TransactionID)
	} else {
		log.Printf("[SWIFT] tx=%s FAILED reason=%q", event.TransactionID, outcome.Reason)
	}
}

func serveHealth(port string) {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	log.Printf("swift-adapter health endpoint on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Printf("health server stopped: %v", err)
	}
}
