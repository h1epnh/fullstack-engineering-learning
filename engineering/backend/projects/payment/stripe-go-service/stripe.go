package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/paymentintent"
)

func main() {
	http.HandleFunc("/create-payment-intent", handleCreatePaymentIntent)
	http.HandleFunc("/products", handleProducts)
	http.HandleFunc("/orders", handleOrders)
	http.HandleFunc("/users", handleUsers)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Listening on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleCreatePaymentIntent(w http.ResponseWriter, r *http.Request) {
	stripe.Key = "sk_test_51MhBWvEnirIWhVQORtHVZ9uIib7twExWTGyMROk6CWmF9Qq7G3kxdht1DGru51zTjzly2eVUQV6x8PUDjqmx9gpd00ubDbNKpk" // Replace with your Stripe secret key

	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(15000), // Amount in cents
		Currency: stripe.String(string(stripe.CurrencyVND)),
	}
	pi, err := paymentintent.New(params)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "PaymentIntent created: %s", pi.ID)
}

func handleProducts(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		// Handle fetching products
		products := []string{"Product 1", "Product 2", "Product 3"}
		json.NewEncoder(w).Encode(products)
	case http.MethodPost:
		// Handle adding a new product
		var product string
		if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		fmt.Fprintf(w, "Product added: %s", product)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func handleOrders(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		// Handle fetching orders
		orders := []string{"Order 1", "Order 2", "Order 3"}
		json.NewEncoder(w).Encode(orders)
	case http.MethodPost:
		// Handle creating a new order
		var order string
		if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		fmt.Fprintf(w, "Order created: %s", order)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func handleUsers(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		// Handle fetching users
		users := []string{"User 1", "User 2", "User 3"}
		json.NewEncoder(w).Encode(users)
	case http.MethodPost:
		// Handle adding a new user
		var user string
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		fmt.Fprintf(w, "User added: %s", user)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
