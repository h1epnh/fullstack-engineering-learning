package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"rbac-go-service/internal/services"

	"github.com/golang-jwt/jwt/v4"
	"github.com/gorilla/mux"
)

var rbacService = services.NewRBACService()
var jwtKey = []byte("my_secret_key")

type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type Claims struct {
	UserID string `json:"userID"`
	jwt.StandardClaims
}

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	var creds Credentials
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// For simplicity, we are using a hardcoded user. In a real application, you should validate the user credentials from a database.
	if creds.Username != "john_doe" || creds.Password != "password123" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	// Create a new token object, specifying signing method and the claims
	expirationTime := time.Now().Add(5 * time.Minute)
	claims := &Claims{
		UserID: "1", // This should be the actual user ID from your database
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Return the token
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}

func HandleAccess(w http.ResponseWriter, r *http.Request) {
	// Logic for handling access control
	userID := r.Context().Value("userID").(string)
	action := r.URL.Query().Get("action")

	if rbacService.CheckPermission(userID, action) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Access granted"))
	} else {
		w.WriteHeader(http.StatusForbidden)
		w.Write([]byte("Access denied " + userID + " " + action))
	}
}

func RegisterRoutes(r *mux.Router) {
	r.HandleFunc("/login", HandleLogin).Methods("POST")
	r.HandleFunc("/access", HandleAccess).Methods("GET")
}
