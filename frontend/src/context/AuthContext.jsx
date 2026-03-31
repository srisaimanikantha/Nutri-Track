import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Dynamic API URL based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
    const [dbUser, setDbUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            
            if (savedToken && savedUser) {
                setToken(savedToken);
                setDbUser(JSON.parse(savedUser));
            }
            setLoading(false);
        };
        verifySession();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            const { user, token: newToken } = res.data;
            
            setDbUser(user);
            setToken(newToken);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(user));
            return { success: true };
        } catch (err) {
            console.error("Login failed", err);
            return { success: false, error: err.response?.data?.error || 'Login failed' };
        }
    };

    const signup = async (email, password, displayName) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/signup`, { email, password, displayName });
            const { user, token: newToken } = res.data;
            
            setDbUser(user);
            setToken(newToken);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(user));
            return { success: true };
        } catch (err) {
            console.error("Signup failed", err);
            return { success: false, error: err.response?.data?.error || 'Signup failed' };
        }
    };

    const logout = () => {
        setDbUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };
    
    const refreshDbUser = async () => {
        if (!dbUser?._id) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/user/${dbUser._id}`);
            setDbUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch(err) {}
    };

    const value = { 
        currentUser: dbUser, // Mapping dbUser to currentUser for compatibility
        dbUser, 
        token,
        login, 
        signup,
        logout, 
        refreshDbUser 
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

