import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Plus, History, ChevronDown } from 'lucide-react';
import { api } from '../services/api'; // Import API

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [user, setUser] = useState(null);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryData = await api.getSummary();
        const userData = await api.getUser();
        setSummary(summaryData);
        setUser(userData);
        setTotalSpent(summaryData.reduce((acc, item) => acc + item.total, 0));
      } catch (error) {
        console.error("Failed to fetch dashboard data");
      }
    };
    fetchData();
  }, []);

  const budgetPercentage = user ? (totalSpent / user.budget) * 100 : 0;
  
  const getProgressColor = () => {
    if (budgetPercentage < 50) return 'bg-green-500';
    if (budgetPercentage < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Premium Card */}
      <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-3xl p-6 lg:p-8 mb-8 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Monthly Spending</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-white">₹{totalSpent.toLocaleString()}</h2>
          </div>
          <div className="bg-purple-600/30 p-4 rounded-2xl">
            <TrendingUp className="text-purple-400" size={32} />
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Budget Used</span>
            <span className="text-white font-semibold">{budgetPercentage.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor()} transition-all duration-500 ${budgetPercentage > 100 ? 'animate-pulse' : ''}`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            />
          </div>
          {user && (
            <p className="text-gray-400 text-xs mt-2">
              ₹{(user.budget - totalSpent).toLocaleString()} remaining of ₹{user.budget.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid gap-4 mb-8">
        <button
          onClick={() => navigate('/add')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 px-8 rounded-2xl flex items-center justify-between shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Plus size={24} />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold">Add New Expense</h3>
              <p className="text-purple-200 text-sm">Track your spending</p>
            </div>
          </div>
          <ChevronDown className="rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => navigate('/history')}
          className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 text-white py-6 px-8 rounded-2xl flex items-center justify-between transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-600/20 p-3 rounded-xl">
              <History size={24} className="text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold">View History</h3>
              <p className="text-gray-400 text-sm">See all transactions</p>
            </div>
          </div>
          <ChevronDown className="rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Chart */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6">Category Breakdown</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={summary}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="total"
                label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
              >
                {summary.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;