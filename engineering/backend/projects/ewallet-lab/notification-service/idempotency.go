package main

import "sync"

// idempotencyCache is a bounded, in-memory, FIFO-eviction set of eventIds already processed.
//
// ADR-06 (DESIGN.md): SQS standard queues are only at-least-once — the same eventId can arrive
// more than once (duplicate delivery, or a redrive after this process crashed AFTER deleting the
// message but BEFORE finishing its own bookkeeping — not possible here since delete happens last,
// but duplicate delivery alone is enough). eventId is the idempotency key; seeing it twice must be
// a no-op, not a second "notification sent" log line.
//
// Documented lab-scale limitation, not a bug to silently hide: this cache lives in process memory
// only and resets on every pod restart/redeploy. A duplicate that happens to arrive AFTER a restart
// will be treated as new and logged again. Closing that gap for real would need a durable dedupe
// store (e.g. DynamoDB with a TTL, or Postgres) — out of scope for this lab's "simulate sending a
// notification" use case, where a duplicate log line is a cosmetic annoyance, not a money bug
// (contrast with wallet-service's Transaction.idempotencyKey, which DOES need to be durable because
// it guards real ledger writes).
type idempotencyCache struct {
	mu       sync.Mutex
	capacity int
	seen     map[string]struct{}
	order    []string // FIFO eviction order, oldest first
}

func newIdempotencyCache(capacity int) *idempotencyCache {
	return &idempotencyCache{
		capacity: capacity,
		seen:     make(map[string]struct{}, capacity),
		order:    make([]string, 0, capacity),
	}
}

// seenBefore reports whether eventID was already recorded, and records it if not (test-and-set,
// one lock acquisition — avoids a race between a caller's "contains?" check and its own "add").
func (c *idempotencyCache) seenBefore(eventID string) bool {
	c.mu.Lock()
	defer c.mu.Unlock()

	if _, ok := c.seen[eventID]; ok {
		return true
	}
	if len(c.order) >= c.capacity {
		oldest := c.order[0]
		c.order = c.order[1:]
		delete(c.seen, oldest)
	}
	c.seen[eventID] = struct{}{}
	c.order = append(c.order, eventID)
	return false
}
