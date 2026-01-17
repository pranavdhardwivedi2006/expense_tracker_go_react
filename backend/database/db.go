package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

func ConnectDB() *mongo.Client {
	// 1. Set connection URI
	clientOptions := options.Client().ApplyURI("mongodb://127.0.0.1:27017")

	// 2. Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 3. Connect
	var err error
	Client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Connection Failed:", err)
	}

	// 4. Ping to verify
	err = Client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Either MongoDB is not started or connection failed:", err)
	}

	fmt.Println("Successfully Connected to MongoDB!")
	return Client
}
