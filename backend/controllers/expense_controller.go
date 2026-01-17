package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"expense_tracker/database"
	"expense_tracker/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Helper: Extract Email from JWT Token
func getEmailFromToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return ""
	}
	// Remove "Bearer " prefix
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	claims := &Claims{}
	// jwtKey comes from auth_controller.go (make sure they are in the same package)
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil || !token.Valid {
		return ""
	}
	return claims.Email
}

// 1. CREATE Expense
func CreateExpense(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Security: Get User Email
	userEmail := getEmailFromToken(r)
	if userEmail == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	var expense models.Expense
	_ = json.NewDecoder(r.Body).Decode(&expense)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	expense.ID = primitive.NewObjectID()
	expense.Email = userEmail // <-- Bind expense to this user

	_, err := database.Client.Database("expense_tracker").Collection("expenses").InsertOne(ctx, expense)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to add expense"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(expense)
}

// 2. GET Expenses
func GetExpenses(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Security: Get User Email
	userEmail := getEmailFromToken(r)
	if userEmail == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	var expenses []models.Expense
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Security: Filter by Email
	cursor, err := database.Client.Database("expense_tracker").Collection("expenses").Find(ctx, bson.M{"email": userEmail})

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Error fetching expenses"})
		return
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var expense models.Expense
		cursor.Decode(&expense)
		expenses = append(expenses, expense)
	}

	if expenses == nil {
		expenses = []models.Expense{}
	}

	json.NewEncoder(w).Encode(expenses)
}

// 3. DELETE Expense
func DeleteExpense(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userEmail := getEmailFromToken(r)
	if userEmail == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	expenseID := params["id"]
	id, err := primitive.ObjectIDFromHex(expenseID)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Security: Delete only if ID AND Email match
	filter := bson.M{"_id": id, "email": userEmail}

	result, err := database.Client.Database("expense_tracker").Collection("expenses").DeleteOne(ctx, filter)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Expense not found or unauthorized"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Expense deleted successfully"})
}

// 4. UPDATE Expense (This is the code you asked for)
func UpdateExpense(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Security: Get User Email
	userEmail := getEmailFromToken(r)
	if userEmail == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	// Get ID from URL
	params := mux.Vars(r)
	expenseID := params["id"]
	id, err := primitive.ObjectIDFromHex(expenseID)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid ID"})
		return
	}

	// Read new data from body
	var expense models.Expense
	if err := json.NewDecoder(r.Body).Decode(&expense); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Security: Only update if ID AND Email match
	filter := bson.M{"_id": id, "email": userEmail}

	update := bson.M{
		"$set": bson.M{
			"title":    expense.Title,
			"amount":   expense.Amount,
			"category": expense.Category,
			"date":     expense.Date,
		},
	}

	result, err := database.Client.Database("expense_tracker").Collection("expenses").UpdateOne(ctx, filter, update)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Could not update"})
		return
	}

	if result.MatchedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Expense not found or unauthorized"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Expense updated successfully"})
}

func GetExpenseSummary(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userEmail := getEmailFromToken(r)
	if userEmail == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// MongoDB Aggregation Pipeline
	// Ye query database mein hi saara calculation kar legi
	pipeline := []bson.M{
		// Stage 1: Sirf logged-in user ka data lo
		{"$match": bson.M{"email": userEmail}},

		// Stage 2: Category ke hisab se group karo aur total amount jodo
		{"$group": bson.M{
			"_id":   "$category",               // Group by Category
			"total": bson.M{"$sum": "$amount"}, // Sum the Amounts
		}},
	}

	cursor, err := database.Client.Database("expense_tracker").Collection("expenses").Aggregate(ctx, pipeline)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	// Result format: [{"_id": "Food", "total": 500}, {"_id": "Travel", "total": 200}]
	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(results)
}
