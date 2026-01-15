"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import ExpenseForm from "../components/ExpenseForm"
import {
  Wallet,
  TrendingUp,
  Pencil,
  Trash2,
  ShoppingCart,
  Car,
  Utensils,
  Film,
  Zap,
  Home,
  Heart,
  MoreHorizontal,
  Receipt,
} from "lucide-react"

// Category icon mapping
const getCategoryIcon = (category) => {
  const categoryLower = category?.toLowerCase() || ""
  if (categoryLower.includes("food") || categoryLower.includes("grocery") || categoryLower.includes("restaurant")) {
    return { icon: Utensils, color: "bg-orange-100 text-orange-600" }
  }
  if (
    categoryLower.includes("transport") ||
    categoryLower.includes("travel") ||
    categoryLower.includes("fuel") ||
    categoryLower.includes("car")
  ) {
    return { icon: Car, color: "bg-blue-100 text-blue-600" }
  }
  if (categoryLower.includes("shopping") || categoryLower.includes("clothes")) {
    return { icon: ShoppingCart, color: "bg-pink-100 text-pink-600" }
  }
  if (categoryLower.includes("entertainment") || categoryLower.includes("movie")) {
    return { icon: Film, color: "bg-purple-100 text-purple-600" }
  }
  if (categoryLower.includes("utility") || categoryLower.includes("bill") || categoryLower.includes("electric")) {
    return { icon: Zap, color: "bg-yellow-100 text-yellow-600" }
  }
  if (categoryLower.includes("rent") || categoryLower.includes("home") || categoryLower.includes("house")) {
    return { icon: Home, color: "bg-green-100 text-green-600" }
  }
  if (categoryLower.includes("health") || categoryLower.includes("medical")) {
    return { icon: Heart, color: "bg-red-100 text-red-600" }
  }
  return { icon: MoreHorizontal, color: "bg-gray-100 text-gray-600" }
}

const Dashboard = () => {
  const [expenses, setExpenses] = useState([])
  const [editingExpense, setEditingExpense] = useState(null)

  const fetchExpenses = () => {
    axios
      .get("http://localhost:5000/api/expenses")
      .then((response) => setExpenses(response.data))
      .catch((error) => console.error("Error fetching data:", error))
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      axios
        .delete(`http://localhost:5000/api/expenses/${id}`)
        .then(() => {
          fetchExpenses()
        })
        .catch((error) => console.error("Error deleting:", error))
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-teal-100 rounded-xl">
            <Wallet className="w-8 h-8 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
            <p className="text-gray-500">Manage your finances effortlessly</p>
          </div>
        </div>

        {/* Total Balance Card */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium mb-1">Total Spending</p>
              <p className="text-4xl font-bold">
                ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                  <Receipt className="w-4 h-4" />
                  {expenses.length} transaction{expenses.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-teal-100 text-sm">Live</span>
            </div>
          </div>
        </div>

        {/* Expense Form */}
        <ExpenseForm onAdd={fetchExpenses} editData={editingExpense} setEditData={setEditingExpense} />

        {/* Recent Expenses */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No expenses yet</p>
              <p className="text-gray-400 text-sm mt-1">Add your first expense to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {expenses.map((expense) => {
                const { icon: CategoryIcon, color } = getCategoryIcon(expense.category)
                return (
                  <div
                    key={expense.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${color}`}>
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{expense.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {expense.category}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(expense.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900 text-lg">₹{expense.amount.toLocaleString("en-IN")}</p>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 rounded-lg hover:bg-teal-100 text-gray-400 hover:text-teal-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-8">Expense Tracker - Keep your finances in check</p>
      </div>
    </div>
  )
}

export default Dashboard
