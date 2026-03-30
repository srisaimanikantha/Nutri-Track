import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [dbUser, setDbUser] = useState(null); // The MongoDB mapped user
    const [loading, setLoading] = useState(true);

    // Watch Firebase Auth
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // Sync with Mongo instantly!
                try {
                    const res = await axios.post('http://localhost:5000/api/auth/login', {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL
                    });
                    setDbUser(res.data.user);
                } catch (err) {
                    console.error("Failed to sync auth with MongoDB", err);
                }
            } else {
                setDbUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const loginWithGoogle = async () => {
        return signInWithPopup(auth, googleProvider);
    };

    const logout = () => {
        return signOut(auth);
    };
    
    // Simple helper to refresh DB user (like after onboarding completes)
    const refreshDbUser = async () => {
        if (!currentUser) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/user/${currentUser.uid}`);
            setDbUser(res.data.user);
        } catch(err) {}
    };

    const value = { currentUser, dbUser, loginWithGoogle, logout, refreshDbUser };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
