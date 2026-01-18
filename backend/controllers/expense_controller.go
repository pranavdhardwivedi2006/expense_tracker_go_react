package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"expense_tracker/database"
	"expense_tracker/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Helper: Extract Email from JWT Token
func getEmailFromToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return ""
	}
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if err != nil || !token.Valid {
		return ""
	}
	return claims.Email
}

// 1. CREATE Expense (Date Fix Applied)
func CreateExpense(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userEmail := getEmailFromToken(r)
	if userEmail == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	var expense models.Expense
	_ = json.NewDecoder(r.Body).Decode(&expense)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	expense.ID = primitive.NewObjectID()
	expense.Email = userEmail

	// FIX: String check instead of .IsZero() [Image 1 Solution]
	if expense.Date == "" {
		expense.Date = time.Now().Format("2006-01-02")
	}

	_, err := database.Client.Database("expense_tracker").Collection("expenses").InsertOne(ctx, expense)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to add expense"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(expense)
}

// 2. GET Expenses (Unkeyed Fields Fix Applied)
func GetExpenses(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userEmail := getEmailFromToken(r)
	if userEmail == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	query := r.URL.Query()
	monthStr := query.Get("month")
	yearStr := query.Get("year")
	category := query.Get("category")

	filter := bson.M{"email": userEmail}

	if monthStr != "" && yearStr != "" {
		month, _ := strconv.Atoi(monthStr)
		year, _ := strconv.Atoi(yearStr)

		startDate := fmt.Sprintf("%04d-%02d-01", year, month)

		endMonth := month + 1
		endYear := year
		if endMonth > 12 {
			endMonth = 1
			endYear++
		}
		endDate := fmt.Sprintf("%04d-%02d-01", endYear, endMonth)

		filter["date"] = bson.M{
			"$gte": startDate,
			"$lt":  endDate,
		}
	}

	if category != "" && category != "All" {
		filter["category"] = category
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// FIX: Added 'Key' and 'Value' explicitly [Image 2 Solution]
	opts := options.Find().SetSort(bson.D{{Key: "date", Value: -1}})

	cursor, err := database.Client.Database("expense_tracker").Collection("expenses").Find(ctx, filter, opts)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var expenses []models.Expense
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
	id, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"_id": id, "email": userEmail}
	result, err := database.Client.Database("expense_tracker").Collection("expenses").DeleteOne(ctx, filter)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if result.DeletedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Expense not found"})
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Deleted successfully"})
}

// 4. UPDATE Expense
func UpdateExpense(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	userEmail := getEmailFromToken(r)
	if userEmail == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	params := mux.Vars(r)
	id, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	var expense models.Expense
	if err := json.NewDecoder(r.Body).Decode(&expense); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

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
		return
	}
	if result.MatchedCount == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Updated successfully"})
}

// 5. GET Summary
func GetExpenseSummary(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	userEmail := getEmailFromToken(r)
	if userEmail == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pipeline := []bson.M{
		{"$match": bson.M{"email": userEmail}},
		{"$group": bson.M{
			"_id":   "$category",
			"total": bson.M{"$sum": "$amount"},
		}},
	}
	cursor, err := database.Client.Database("expense_tracker").Collection("expenses").Aggregate(ctx, pipeline)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)
	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(results)
}
