import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

// Components
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Logger from './pages/Logger';
import History from './pages/History';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
  const { currentUser, dbUser } = useAuth();
  if (!currentUser) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen">
            <Navbar />
            
            <Routes>
              {/* Public Logic Route */}
              <Route path="/" element={<Login />} />
              
              {/* Onboarding Wizard strictly guarded */}
              <Route path="/onboard" element={
                  <PrivateRoute>
                      <Onboarding />
                  </PrivateRoute>
              } />

              {/* The Central Hub */}
              <Route path="/dashboard" element={ <PrivateRoute><Dashboard /></PrivateRoute> } />
              
              {/* Separate Logger Page */}
              <Route path="/logger" element={ <PrivateRoute><Logger /></PrivateRoute> } />

              {/* Separate History Page */}
              <Route path="/history" element={ <PrivateRoute><History /></PrivateRoute> } />

              {/* Separate Profile Page */}
              <Route path="/profile" element={ <PrivateRoute><Profile /></PrivateRoute> } />

            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

