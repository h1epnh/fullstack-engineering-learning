package main

import (
	"context"
	"testing"
	"time"
)

func TestBackoffDelayExponentialAndCapped(t *testing.T) {
	cases := []struct {
		failures int
		want     time.Duration
	}{
		{0, 0}, {1, 1 * time.Second}, {2, 2 * time.Second}, {3, 4 * time.Second},
		{6, 32 * time.Second}, {7, 60 * time.Second}, {50, 60 * time.Second}, {10000, 60 * time.Second},
	}
	for _, c := range cases {
		if got := backoffDelay(c.failures, backoffBase, backoffMax); got != c.want {
			t.Errorf("backoffDelay(%d) = %s, want %s", c.failures, got, c.want)
		}
	}
}

func TestSleepCtxReturnsImmediatelyOnCancel(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	start := time.Now()
	if sleepCtx(ctx, 30*time.Second) {
		t.Fatal("sleepCtx should report false when ctx is cancelled")
	}
	if time.Since(start) > time.Second {
		t.Fatal("sleepCtx did not respect ctx.Done()")
	}
}

func TestSleepCtxCompletes(t *testing.T) {
	if !sleepCtx(context.Background(), 10*time.Millisecond) {
		t.Fatal("sleepCtx should return true when the timer fires")
	}
}
