import { useState, useEffect } from "react"
import axios from "axios"
import { FileText, DollarSign, Tag, Calendar, Plus, Pencil, X } from "lucide-react"

const ExpenseForm = ({ onAdd, editData, setEditData }) => {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  })

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title,
        amount: editData.amount,
        category: editData.category,
        date: new Date(editData.date).toISOString().split("T")[0], // Date format fix
      })
    } else {
      setFormData({ title: "", amount: "", category: "", date: "" })
    }
  }, [editData])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // token nikalo
    const token = localStorage.getItem('token')
    
    // header banao
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }

    try {
      if (editData) {
        // === UPDATE LOGIC (PUT Request) ===
        await axios.put(
          `http://localhost:5000/api/expenses/${editData.id}`, 
          {
            title: formData.title,
            amount: Number.parseFloat(formData.amount),
            category: formData.category,
            date: formData.date,
          },
          config // <-- Token bheja
        )
        alert("Expense Updated!")
        onAdd()
        setEditData(null)
        setFormData({ title: "", amount: "", category: "", date: "" })
        
      } else {
        // === ADD LOGIC (POST Request) ===
        await axios.post(
          "http://localhost:5000/api/expenses", 
          {
            title: formData.title,
            amount: Number.parseFloat(formData.amount),
            category: formData.category,
            date: formData.date,
          },
          config // <-- Token bheja
        )
        alert("Expense Added!")
        onAdd()
        setFormData({ title: "", amount: "", category: "", date: "" })
      }
    } catch (err) {
      console.error(err)
      alert("Error saving expense. Please try logging in again.")
    }
  }

  const handleCancel = () => {
    setEditData(null)
    setFormData({ title: "", amount: "", category: "", date: "" })
  }

  return (
    <div
      className={`rounded-xl border shadow-sm p-6 mb-6 transition-all duration-300 ${
        editData ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${editData ? "bg-amber-100" : "bg-teal-100"}`}>
          {editData ? (
            <Pencil className={`w-5 h-5 ${editData ? "text-amber-600" : "text-teal-600"}`} />
          ) : (
            <Plus className="w-5 h-5 text-teal-600" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{editData ? "Edit Expense" : "Add New Expense"}</h3>
          <p className="text-sm text-gray-500">
            {editData ? "Update your expense details below" : "Track your spending by adding a new expense"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="w-4 h-4 text-gray-400" />
              </div>
              <input
                name="title"
                placeholder="e.g., Grocery Shopping"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
              <input
                name="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Category Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="w-4 h-4 text-gray-400" />
              </div>
              <input
                name="category"
                placeholder="e.g., Food, Transport"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Date Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all hover:shadow-lg ${
              editData ? "bg-amber-500 hover:bg-amber-600" : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {editData ? (
              <>
                <Pencil className="w-4 h-4" />
                Update Expense
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Expense
              </>
            )}
          </button>

          {editData && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ExpenseForm