package services

import (
	"time"

	"github.com/golang-jwt/jwt/v4"
)

type Claims struct {
	Email string `json:"email"`
	jwt.StandardClaims
}

func GenerateJWT(email string) (string, error) {
	expirationTime := time.Now().Add(5 * time.Minute)
	claims := &Claims{
		Email: email,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(config.JWTKey)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func ParseJWT(tokenStr string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return config.JWTKey, nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	return claims, nil
}
