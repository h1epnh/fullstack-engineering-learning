package services

import (
	"fmt"
	"time"
	// "github.com/yourusername/mfa-go-service/internal/config"
)

func RateLimit(email string) error {
	key := fmt.Sprintf("rate_limit:%s", email)
	limit := 5
	duration := time.Minute

	count, err := config.RedisClient.Get(config.Ctx, key).Int()
	if err != nil && err != redis.Nil {
		return err
	}

	if count >= limit {
		return fmt.Errorf("too many requests")
	}

	if err == redis.Nil {
		err = config.RedisClient.Set(config.Ctx, key, 1, duration).Err()
	} else {
		err = config.RedisClient.Incr(config.Ctx, key).Err()
	}

	if err != nil {
		return err
	}

	return nil
}
