package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"expense_tracker/database"
	"expense_tracker/models"

	"go.mongodb.org/mongo-driver/bson"
)

func SetBudget(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userEmail := getEmailFromToken(r)
	if userEmail == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	var data struct {
		Limit float64 `json:"limit"`
	}
	_ = json.NewDecoder(r.Body).Decode(&data)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Database update karo
	collection := database.Client.Database("expense_tracker").Collection("users")
	filter := bson.M{"email": userEmail}
	update := bson.M{"$set": bson.M{"budget": data.Limit}}

	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to update budget"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Budget limit updated successfully"})
}

func GetUserProfile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userEmail := getEmailFromToken(r)
	if userEmail == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	var user models.User
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.Client.Database("expense_tracker").Collection("users")

	err := collection.FindOne(ctx, bson.M{"email": userEmail}).Decode(&user)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	user.Password = ""

	json.NewEncoder(w).Encode(user)
}
