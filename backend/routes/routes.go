package routes

import (
	"expense_tracker/controllers"
	"expense_tracker/middleware"

	"github.com/gorilla/mux"
)

// take router from main file and define all expense related routes
func SetupRoutes(r *mux.Router) {

	r.HandleFunc("/api/register", controllers.Register).Methods("POST")
	r.HandleFunc("/api/login", controllers.Login).Methods("POST")

	// --- PROTECTED ROUTES (Only for users with Token) ---
	// Create a "Subrouter" that has the middleware (Lock) applied
	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.IsAuthorized) // <-- Apply the middleware lock here

	api.HandleFunc("/expenses", controllers.GetExpenses).Methods("GET")
	api.HandleFunc("/expenses", controllers.CreateExpense).Methods("POST")
	api.HandleFunc("/expenses/{id}", controllers.DeleteExpense).Methods("DELETE")
	api.HandleFunc("/expenses/{id}", controllers.UpdateExpense).Methods("PUT")

	api.HandleFunc("/summary", controllers.GetExpenseSummary).Methods("GET")

	api.HandleFunc("/user", controllers.GetUserProfile).Methods("GET")
	api.HandleFunc("/user/budget", controllers.SetBudget).Methods("PUT")
}
