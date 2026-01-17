import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Wallet, Plus, History, Settings, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { api } from './services/api';

// --- IMPORTS JO MISSING THE (Ye Add Kiye Hain) ---
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import HistoryPage from './pages/History'; // Dhyan dena: file ka naam History.jsx hai par component HistoryPage hai
import SettingsPage from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Navigation Component
const NavigationLayout = ({ children, darkMode, setDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: 'User', email: '' });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadUser = async () => {
        try {
            const userData = await api.getUser();
            if (userData) setUser(userData);
        } catch (e) {
            console.log("User load error (might be not logged in)");
        }
    };
    // Sirf tab load karo jab hum login page par na hon
    if (location.pathname !== '/login' && location.pathname !== '/register') {
        loadUser();
    }
  }, [location.pathname]); // Path change hone par retry karega

  const handleLogout = () => {
    if(window.confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('token');
        navigate('/login');
    }
  };

  const menuItems = [
    { id: '/dashboard', icon: Wallet, label: 'Dashboard' },
    { id: '/add', icon: Plus, label: 'Add Expense' },
    { id: '/history', icon: History, label: 'History' },
    { id: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900' 
        : 'bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50'
    }`}>
      
      {/* Mobile & Desktop Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-4 left-4 z-50 p-3 rounded-xl border transition-colors shadow-lg ${
          darkMode 
            ? 'bg-gray-800 text-white border-gray-700'
            : 'bg-white text-gray-800 border-gray-300'
        }`}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed top-0 left-0 h-screen
          w-72 border-r p-6 z-40 flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-300 shadow-2xl'}
        `}>
          <div className="mb-8 pl-12 flex items-center h-12"> 
            <h1 className={`text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <Wallet className="text-purple-600" />
              ExpenseTrack
            </h1>
          </div>
          
          <nav className="flex-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  location.pathname === item.id 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' 
                    : darkMode 
                      ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className={`mt-auto pt-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className={`flex items-center gap-3 mb-4 p-2 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                <div className="bg-purple-600 p-2 rounded-full">
                    <UserIcon size={20} className="text-white" />
                </div>
                <div className="overflow-hidden">
                    <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.name}
                    </p>
                    <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user.email || "No Email"}
                    </p>
                </div>
            </div>

            <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
            >
                <LogOut size={20} />
                <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-h-screen pt-16 lg:pt-0 p-4 lg:p-8 transition-all">
            <div className="h-12 lg:h-0"></div> 
            {children}
        </div>
      </div>
    </div>
  );
};

// Protected Route Logic
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" />;
};

function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        
        <Route path="/*" element={
            <ProtectedRoute>
                <NavigationLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/add" element={<AddExpense />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/settings" element={<SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </NavigationLayout>
            </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;