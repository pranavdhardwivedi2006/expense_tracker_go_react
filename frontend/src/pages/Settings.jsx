import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, User, Wallet, Moon, Sun } from 'lucide-react';
import { api } from '../services/api';

const SettingsPage = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [budget, setBudget] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.getUser();
        setUser(userData);
        setBudget(userData.budget);
      } catch(e) { console.error("Error loading user settings"); }
    };
    fetchUser();
  }, []);

  const handleSaveBudget = async () => {
    try {
        await api.updateBudget(parseInt(budget));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        // Update local user state to reflect changes immediately
        setUser(prev => ({...prev, budget: parseInt(budget)}));
    } catch (e) { console.error("Error saving budget"); }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className={`flex items-center gap-2 mb-6 transition-colors ${
          darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>

      {showSuccess && (
        <div className="bg-green-600/20 border border-green-600 text-green-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <Check size={20} />
          Settings saved successfully!
        </div>
      )}

      <div className="space-y-6">
        {/* Profile (Read Only) */}
        <div className={`backdrop-blur-xl rounded-2xl p-6 border ${
          darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'
        }`}>
          <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <User size={20} className="text-purple-400" />
            Profile Information
          </h3>
          {user ? (
            <div className="space-y-3">
              <div className={`flex justify-between items-center py-2 border-b ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Name</span>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Email</span>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.email}</span>
              </div>
            </div>
          ) : (
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
          )}
        </div>

        {/* Budget Setting */}
        <div className={`backdrop-blur-xl rounded-2xl p-6 border ${
          darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'
        }`}>
          <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Wallet size={20} className="text-purple-400" />
            Monthly Budget Limit
          </h3>
          <div className="flex gap-3">
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={`flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:border-purple-600 ${
                darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Enter budget"
            />
            <button
              onClick={handleSaveBudget}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Save
            </button>
          </div>
          {user && (
            <p className={`text-xs mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Current budget: ₹{user.budget.toLocaleString()}
            </p>
          )}
        </div>

        {/* Theme Toggle */}
        <div className={`backdrop-blur-xl rounded-2xl p-6 border ${
          darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'
        }`}>
          <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Appearance
          </h3>
          <div className={`flex items-center justify-between py-3 px-4 rounded-xl ${
            darkMode ? 'bg-gray-900/50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={20} className="text-purple-400" /> : <Sun size={20} className="text-orange-400" />}
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {darkMode ? 'Dark Mode' : 'Light Mode'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                darkMode ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform flex items-center justify-center ${
                darkMode ? 'translate-x-6' : ''
              }`}>
                {darkMode ? <Moon size={12} /> : <Sun size={12} />}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;