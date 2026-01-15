package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// global variable to use the database from other files
var Collection *mongo.Collection

func ConnectDB() {
	// address of MongoDB server
	clientOptions := options.Client().ApplyURI("mongodb://127.0.0.1:27017")

	// timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Connection Failed:", err)
	}

	// check the Connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Either MongoDb is not started or connection failed:", err)
	}

	fmt.Println("Successfully Connected to MongoDB!")

	// Collection Set karna
	// DB Name: expense_tracker_db, Collection Name: expenses
	Collection = client.Database("expense_tracker_db").Collection("expenses")
}
