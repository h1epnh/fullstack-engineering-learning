// notification-service (ADR-06, DESIGN.md): consumes the SQS queue
// `ewallet-lab-payment-completed-notify`, which is subscribed to the SNS topic
// `ewallet-lab-payment-completed` that wallet-service publishes to after every committed
// debit/credit. This is a SECOND, isolated async layer — it does not touch, replace, or route
// any of the existing Kafka/Outbox flows (fund-service/lucky-money-service/topup-service/
// payment-request-service/bill-payment-service). See DESIGN.md's ADR-06 for the full spec.
//
// "Notification delivery" here is always a simulated, structured log line (push/SMS/email are
// never actually called — same lab convention other services use for mocked external sends). The
// point of this service is to exercise real AWS fan-out/DLQ/idempotent-consumer mechanics, not to
// deliver a real notification.
//
// Written in Go, not Spring Boot, specifically to avoid worsening the cluster's RAM overcommit
// (DESIGN.md "Ngân sách RAM" / issue #53 / TD-01) — same precedent as mock-bank-gateway.
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
)

const idempotencyCacheCapacity = 10_000

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// requireEnv reads a mandatory env var and exits loudly if missing — same convention
// mock-bank-gateway uses for BANK_GATEWAY_ACCESS_KEY/SECRET_KEY (issue #52): a missing credential
// must fail fast at startup where the operator can see it, never silently fall back to a
// hardcoded/default value.
func requireEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("%s must be set (ADR-06: AWS credentials/region/queue come from env only, "+
			"via the ewallet-lab-aws-notify k8s Secret + Helm values — see DESIGN.md)", key)
	}
	return v
}

func main() {
	// ADR-06: credentials/region come ONLY from these 3 env vars (k8s Secret
	// `ewallet-lab-aws-notify`, created by the operator after running
	// scripts/init-aws-infra.sh — this process never falls back to ~/.aws/config, an instance
	// profile, or any other credential source).
	accessKeyID := requireEnv("AWS_ACCESS_KEY_ID")
	secretAccessKey := requireEnv("AWS_SECRET_ACCESS_KEY")
	region := requireEnv("AWS_DEFAULT_REGION")
	// Not a credential — the queue's own URL (account id + queue name), fixed per DESIGN.md's
	// naming (`ewallet-lab-payment-completed-notify`). Plain Helm value, not secret material.
	queueURL := requireEnv("SQS_QUEUE_URL")

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	awsCfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion(region),
		// Explicit StaticCredentialsProvider, not the SDK's default provider chain — this means
		// the 3 env vars above are the ONLY way this process can ever get credentials, by
		// construction, rather than "by convention, as long as nothing else on the pod ever sets
		// ~/.aws/config or an EC2/IRSA identity".
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKeyID, secretAccessKey, "")),
	)
	if err != nil {
		log.Fatalf("failed to build AWS config: %v", err)
	}
	sqsClient := sqs.NewFromConfig(awsCfg)

	cache := newIdempotencyCache(idempotencyCacheCapacity)

	go runConsumeLoop(ctx, sqsClient, queueURL, cache)

	startHealthServer(ctx)
}

// startHealthServer runs a tiny HTTP server with only /healthz — same shape as
// mock-bank-gateway's — purely so k8s readiness/liveness probes have something to hit. The
// consumer loop above has no HTTP surface of its own (it's a pure SQS poller), so this is the
// ENTIRE reason this service has an HTTP port at all.
func startHealthServer(ctx context.Context) {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	port := getenv("HTTP_PORT", "8103")
	srv := &http.Server{Addr: ":" + port, Handler: mux}

	go func() {
		<-ctx.Done()
		_ = srv.Close()
	}()

	log.Printf("notification-service healthz listening on :%s; SQS long-poll consumer running in background", port)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("health server stopped: %v", err)
	}
}
