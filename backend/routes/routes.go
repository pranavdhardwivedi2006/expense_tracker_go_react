package routes

import (
	"expense_tracker/controllers"

	"github.com/gorilla/mux"
)

// take router from main file and define all expense related routes
func ExpenseRoutes(r *mux.Router) {

	r.HandleFunc("/api/expenses", controllers.GetAllExpenses).Methods("GET")

	r.HandleFunc("/api/expenses", controllers.AddExpense).Methods("POST")

	r.HandleFunc("/api/expenses/{id}", controllers.DeleteExpense).Methods("DELETE")

	r.HandleFunc("/api/expenses/{id}", controllers.UpdateExpense).Methods("PUT")
}
