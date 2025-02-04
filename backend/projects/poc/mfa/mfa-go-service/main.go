package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/dgrijalva/jwt-go"
	_ "github.com/lib/pq"
	"github.com/pquerna/otp/totp"
	"github.com/sirupsen/logrus"
	"golang.org/x/time/rate"
)

var db *sql.DB
var jwtKey = []byte("my_secret_key")
var log = logrus.New()

type Claims struct {
	Email string `json:"email"`
	jwt.StandardClaims
}

type ErrorResponse struct {
	Message string `json:"message"`
}

var rateLimiters = make(map[string]*rate.Limiter)
var mu sync.Mutex

func initDB() {
	var err error
	connStr := "user=postgres dbname=auth sslmode=disable"
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
}

func generateJWT(email string) (string, error) {
	expirationTime := time.Now().Add(5 * time.Minute)
	claims := &Claims{
		Email: email,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func authenticate(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenStr := r.Header.Get("Authorization")
		if tokenStr == "" {
			http.Error(w, "Authorization header is required", http.StatusUnauthorized)
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func rateLimit(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		email := r.URL.Query().Get("email")
		if email == "" {
			http.Error(w, "Email is required", http.StatusBadRequest)
			return
		}

		mu.Lock()
		limiter, exists := rateLimiters[email]
		if !exists {
			limiter = rate.NewLimiter(1, 3) // 1 request per second with a burst of 3
			rateLimiters[email] = limiter
		}
		mu.Unlock()

		if !limiter.Allow() {
			http.Error(w, "Too many requests", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(ErrorResponse{Message: message})
}

func generateOTP(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")
	if email == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}

	issuer := os.Getenv("ISSUER")
	if issuer == "" {
		respondWithError(w, http.StatusInternalServerError, "Issuer is not configured")
		return
	}

	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      issuer,
		AccountName: email,
	})
	if err != nil {
		http.Error(w, "Error generating OTP", http.StatusInternalServerError)
		return
	}

	secret := key.Secret()
	_, err = db.Exec("INSERT INTO users (email, secret, otp_generated_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET secret = $2, otp_generated_at = $3", email, secret, time.Now())
	if err != nil {
		http.Error(w, "Error storing secret", http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "OTP generated. Secret stored for email: %s\n", email)
}

func verifyOTP(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")
	otp := r.URL.Query().Get("otp")
	if email == "" || otp == "" {
		http.Error(w, "Email and OTP are required", http.StatusBadRequest)
		return
	}

	var secret string
	var otpGeneratedAt time.Time
	err := db.QueryRow("SELECT secret, otp_generated_at FROM users WHERE email = $1", email).Scan(&secret, &otpGeneratedAt)
	if err != nil {
		http.Error(w, "Error retrieving secret", http.StatusInternalServerError)
		return
	}

	// Check if the OTP is expired
	otpExpiryDuration := 5 * time.Minute
	if time.Since(otpGeneratedAt) > otpExpiryDuration {
		respondWithError(w, http.StatusUnauthorized, "OTP has expired")
		return
	}

	valid := totp.Validate(otp, secret)
	if valid {
		fmt.Fprintln(w, "OTP is valid")
	} else {
		respondWithError(w, http.StatusUnauthorized, "OTP is invalid")
	}
}

func login(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")
	if email == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}

	token, err := generateJWT(email)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	log.WithFields(logrus.Fields{
		"email": email,
	}).Info("JWT generated")

	fmt.Fprintf(w, "JWT: %s\n", token)
}

func main() {

	log.SetFormatter(&logrus.JSONFormatter{})
	log.SetOutput(os.Stdout)
	log.SetLevel(logrus.InfoLevel)

	initDB()

	http.HandleFunc("/login", login)
	http.HandleFunc("/generate", rateLimit(generateOTP))
	http.HandleFunc("/verify", rateLimit(verifyOTP))

	log.Info("Starting server at :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
