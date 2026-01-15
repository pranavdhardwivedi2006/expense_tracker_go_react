package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"expense_tracker/database"
	"expense_tracker/routes"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	database.ConnectDB()

	r := mux.NewRouter() // router

	routes.ExpenseRoutes(r)

	// test route
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		w.WriteHeader(http.StatusOK)

		json.NewEncoder(w).Encode(map[string]string{
			"message": "Hello! Expense Tracker (Mux Version) is Working!",
		})
	}).Methods("GET")

	// CORS Setup
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // address of frontend
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: true,
	})

	// wrap the router with CORS middleware
	handler := c.Handler(r)

	// server start
	fmt.Println("Server Mux ke sath start ho raha hai port 5000 par...")
	log.Fatal(http.ListenAndServe(":5000", handler))
}
