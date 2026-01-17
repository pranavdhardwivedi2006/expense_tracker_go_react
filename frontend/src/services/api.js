import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const api = {
    // 1. Dashboard Data
    getSummary: async () => {
        const res = await axios.get(`${API_URL}/summary`, getAuthHeader());
        return res.data.map(item => ({ _id: item._id, total: item.total }));
    },
    
    // 2. User Profile & Budget
    getUser: async () => {
        const res = await axios.get(`${API_URL}/user`, getAuthHeader());
        return res.data;
    },
    updateBudget: async (limit) => {
        return axios.put(`${API_URL}/user/budget`, { limit }, getAuthHeader());
    },

    // 3. Expenses List (With Filters)
    getExpenses: async (month, year, category) => {
        const res = await axios.get(`${API_URL}/expenses`, { 
            params: { month, year, category },
            ...getAuthHeader()
        });
        return res.data;
    },

    // 4. Add Expense
    addExpense: async (expense) => {
        return axios.post(`${API_URL}/expenses`, expense, getAuthHeader());
    },

    // 5. Delete Expense (NEW)
    deleteExpense: async (id) => {
        return axios.delete(`${API_URL}/expenses/${id}`, getAuthHeader());
    }
};