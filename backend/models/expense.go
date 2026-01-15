package models

import "go.mongodb.org/mongo-driver/bson/primitive"

// structure for Expense
type Expense struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string             `bson:"title" json:"title"`
	Amount      float64            `bson:"amount" json:"amount"`
	Category    string             `bson:"category" json:"category"`
	Description string             `bson:"description" json:"description"`
	Date        string             `bson:"date" json:"date"`
}
