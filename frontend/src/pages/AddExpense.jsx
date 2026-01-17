import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Tag, DollarSign, Calendar } from 'lucide-react';
import { api } from '../services/api';

const AddExpense = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Data receive karne ke liye
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Edit Mode Flag
  const [oldId, setOldId] = useState(null); // Edit ke waqt purana ID rakhne ke liye

  // Check karo agar History se Edit dabaya gaya hai
  useEffect(() => {
      if (location.state && location.state.editMode) {
          const { expenseData } = location.state;
          setFormData({
              title: expenseData.title,
              amount: expenseData.amount,
              category: expenseData.category,
              date: new Date(expenseData.date).toISOString().split('T')[0]
          });
          setIsEditing(true);
          setOldId(expenseData.id);
      }
  }, [location]);

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Other'];

  const handleSubmit = async () => {
    if (!formData.title || !formData.amount) return;
    try {
        // Step 1: Agar Edit hai, toh pehle purana delete karo
        if (isEditing && oldId) {
            await api.deleteExpense(oldId);
        }

        // Step 2: Naya Data Add karo
        await api.addExpense({
            ...formData,
            amount: parseFloat(formData.amount)
        });

        setShowSuccess(true);
        
        // Step 3: Agar Edit tha, toh wapas History bhej do
        if (isEditing) {
            setTimeout(() => navigate('/history'), 1500);
        } else {
            // Agar Naya tha, toh form clear karo aur yahin raho
            setFormData({
                title: '',
                amount: '',
                category: 'Food',
                date: new Date().toISOString().split('T')[0]
            });
            setTimeout(() => setShowSuccess(false), 3000);
        }
    } catch (error) {
        console.error("Failed to save expense");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-8">
            {isEditing ? "Edit Expense" : "Add New Expense"}
        </h2>

        {showSuccess && (
          <div className="bg-green-600/20 border border-green-600 text-green-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <Check size={20} />
            {isEditing ? "Expense updated successfully!" : "Expense added successfully!"}
          </div>
        )}

        <div className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Title</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-12 py-4 text-white focus:outline-none focus:border-purple-600 transition-colors" 
                placeholder="e.g., Grocery Shopping" 
              />
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="number" 
                value={formData.amount} 
                onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-12 py-4 text-white focus:outline-none focus:border-purple-600 transition-colors" 
                placeholder="0" 
              />
            </div>
          </div>

          {/* Category Select */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Category</label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})} 
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-purple-600 transition-colors"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-12 py-4 text-white focus:outline-none focus:border-purple-600 transition-colors" 
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit} 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02]"
          >
            {isEditing ? "Update Expense" : "Save Expense"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;