import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Tag, History, Search, Trash2, Edit2, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state add kiya

  // Sirf ek state rakhenge jo user change kar raha hai
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    category: 'All'
  });

  // Data laane ka function (Reusable)
  const fetchExpenses = async (filterData) => {
    setLoading(true);
    try {
      console.log("Fetching with filters:", filterData); // Debugging ke liye
      const data = await api.getExpenses(filterData.month, filterData.year, filterData.category);
      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Initial Load (Component khulte hi)
  useEffect(() => {
    fetchExpenses(filters);
  }, []); // Empty dependency array taaki sirf ek baar chale start mein

  // 2. Apply Button Handler
  const handleApply = () => {
      // Button dabane par wahi filters bhejo jo abhi state mein hain
      fetchExpenses(filters);
  };

  // --- DELETE FUNCTION ---
  const handleDelete = async (id) => {
      if (window.confirm("Are you sure you want to delete this expense?")) {
          try {
              await api.deleteExpense(id);
              // Delete ke baad current filters ke sath hi refresh karo
              fetchExpenses(filters); 
          } catch (e) {
              alert("Failed to delete");
          }
      }
  };

  // --- EDIT FUNCTION ---
  const handleEdit = (expense) => {
      navigate('/add', { state: { editMode: true, expenseData: expense } });
  };

  const groupByDate = (expenses) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    return expenses.reduce((groups, expense) => {
      const expenseDate = new Date(expense.date).toDateString();
      let key = expenseDate;
      if (expenseDate === today) key = 'Today';
      else if (expenseDate === yesterday) key = 'Yesterday';
      if (!groups[key]) groups[key] = [];
      groups[key].push(expense);
      return groups;
    }, {});
  };

  const groupedExpenses = groupByDate(expenses);
  const categories = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Other'];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <h2 className="text-3xl font-bold text-white mb-6">Transaction History</h2>

      {/* Filters Section */}
      <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-gray-700">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Filter className="text-purple-400" size={20} /> Filters
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Month Select */}
          <div>
            <label className="text-gray-400 text-xs mb-2 block">Month</label>
            <select 
              value={filters.month} 
              onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})} 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-600"
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i} value={i + 1}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>

          {/* Year Select */}
          <div>
            <label className="text-gray-400 text-xs mb-2 block">Year</label>
            <select 
              value={filters.year} 
              onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})} 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-600"
            >
              {[2024, 2025, 2026].map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>

          {/* Category Select */}
          <div>
            <label className="text-gray-400 text-xs mb-2 block">Category</label>
            <select 
              value={filters.category} 
              onChange={(e) => setFilters({...filters, category: e.target.value})} 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-600"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {/* Apply Button */}
        <div className="mt-4 flex justify-end">
            <button 
                onClick={handleApply} 
                disabled={loading} // Loading ke time button disable
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                {loading ? 'Applying...' : 'Apply Filters'}
            </button>
        </div>
      </div>

      {/* Loading State or Data */}
      {loading ? (
          <div className="text-center py-12">
              <Loader2 size={48} className="text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading transactions...</p>
          </div>
      ) : Object.keys(groupedExpenses).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedExpenses).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-gray-400 text-sm font-semibold mb-3 px-2">{date}</h3>
              <div className="space-y-2">
                {items.map(expense => (
                  <div key={expense.id || expense._id} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4 hover:bg-gray-800 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-600/20 p-3 rounded-lg">
                          <Tag className="text-purple-400" size={18} />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{expense.title}</h4>
                          <p className="text-gray-400 text-sm">{expense.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-white font-bold text-lg">₹{expense.amount}</p>
                            <p className="text-gray-400 text-xs">{new Date(expense.date).toLocaleDateString()}</p>
                          </div>
                          
                          <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(expense)} className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                                  <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDelete(expense.id || expense._id)} className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
          <History size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-medium">No expenses found</p>
          <p className="text-gray-500 text-sm">Try changing filters to view other months</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;