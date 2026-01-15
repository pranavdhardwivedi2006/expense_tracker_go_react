package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"expense_tracker/database"
	"expense_tracker/models"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// add expense
func AddExpense(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var expense models.Expense

	_ = json.NewDecoder(r.Body).Decode(&expense)

	// set timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// make new ID
	expense.ID = primitive.NewObjectID()

	// put data into database
	_, err := database.Collection.InsertOne(ctx, expense)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to add expense"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(expense)
}

// get all expenses
func GetAllExpenses(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var expenses []models.Expense
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// fetch all data from database
	cursor, err := database.Collection.Find(ctx, bson.M{})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Error fetching expenses"})
		return
	}
	defer cursor.Close(ctx)

	// make a list of expenses
	for cursor.Next(ctx) {
		var expense models.Expense
		cursor.Decode(&expense)
		expenses = append(expenses, expense)
	}

	json.NewEncoder(w).Encode(expenses)
}

func DeleteExpense(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	params := mux.Vars(r)
	expenseID := params["id"]

	id, _ := primitive.ObjectIDFromHex(expenseID)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := database.Collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Could not delete"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Expense deleted successfully"})
}

func UpdateExpense(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	params := mux.Vars(r)
	expenseID := params["id"]
	id, _ := primitive.ObjectIDFromHex(expenseID)

	var expense models.Expense
	_ = json.NewDecoder(r.Body).Decode(&expense)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// update query
	update := bson.M{
		"$set": bson.M{
			"title":    expense.Title,
			"amount":   expense.Amount,
			"category": expense.Category,
			"date":     expense.Date,
		},
	}

	// upadate in database
	_, err := database.Collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Could not update"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Expense updated successfully"})
}
