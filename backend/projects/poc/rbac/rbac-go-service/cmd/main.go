package main

import (
	"log"
	"net/http"
	"rbac-go-service/internal/handlers"
	"rbac-go-service/internal/middleware"

	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()
	// Public routes
	r.HandleFunc("/login", handlers.HandleLogin).Methods("POST")

	// Protected routes
	protected := r.PathPrefix("/").Subrouter()
	protected.Use(middleware.ValidateJWT)
	protected.HandleFunc("/access", handlers.HandleAccess).Methods("GET")

	log.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatalf("Could not start server: %s\n", err.Error())
	}
}
