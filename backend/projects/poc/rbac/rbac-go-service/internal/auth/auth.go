package auth

import (
	"errors"
	"time"

	"github.com/dgrijalva/jwt-go"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	secretKey             = []byte("your_secret_key") // Replace with a secure key
)

// UserCredentials holds the username and password for authentication
type UserCredentials struct {
	Username string
	Password string
}

// TokenResponse holds the JWT token and its expiration
type TokenResponse struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
}

// Authenticate verifies user credentials and returns a token
func Authenticate(credentials UserCredentials) (*TokenResponse, error) {
	// Replace with actual user verification logic
	if credentials.Username != "admin" || credentials.Password != "password" {
		return nil, ErrInvalidCredentials
	}

	// Create the token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": credentials.Username,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	})

	// Sign the token
	tokenString, err := token.SignedString(secretKey)
	if err != nil {
		return nil, err
	}

	return &TokenResponse{
		Token:     tokenString,
		ExpiresAt: time.Now().Add(time.Hour * 72),
	}, nil
}
