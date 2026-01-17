package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"expense_tracker/database"
	"expense_tracker/models"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
)

// signup
func Register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var user models.User
	_ = json.NewDecoder(r.Body).Decode(&user)

	// Context for database timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// access the 'users' collection
	collection := database.Client.Database("expense_tracker").Collection("users")

	// 1. Check if email already exists
	var existingUser models.User
	err := collection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&existingUser)
	if err == nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Email already exists"})
		return
	}

	// 2. Hash (Encrypt) the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Could not create account"})
		return
	}
	user.Password = string(hashedPassword) // Save the hashed password, not the real one!

	// 3. Insert into Database
	_, err = collection.InsertOne(ctx, user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Error saving user"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "User registered successfully!"})
}

// secret key for JWT
var jwtKey = []byte("my_secret_key")

// JWT Claim struct (Token ke andar kya data hoga)
type Claims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

// LOGIN Logic
func Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var user models.User
	var foundUser models.User

	// read the data sent by user
	_ = json.NewDecoder(r.Body).Decode(&user)

	// Database connect karo
	collection := database.Client.Database("expense_tracker").Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 1. Email dhoondho
	err := collection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&foundUser)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid email or password"})
		return
	}

	// 2. Password Match karo (Stored Hash vs Input Password)
	err = bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(user.Password))
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid email or password"})
		return
	}

	// 3. JWT Token Generate karo
	expirationTime := time.Now().Add(24 * time.Hour) // Token 1 din tak valid rahega
	claims := &Claims{
		Email: foundUser.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Could not generate token"})
		return
	}

	// Success! Token wapas bhejo
	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}
