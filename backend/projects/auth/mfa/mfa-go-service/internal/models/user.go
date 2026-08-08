package models

import "time"

type User struct {
	Email          string
	Secret         string
	OTPGeneratedAt time.Time
}
