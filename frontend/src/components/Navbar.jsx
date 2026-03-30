import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const NavLink = ({ to, label }) => {
      const active = location.pathname === to;
      return (
          <button 
              onClick={() => navigate(to)} 
              className={`text-sm font-semibold tracking-widest uppercase px-3 py-1.5 transition-colors ${active ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-zinc-500 hover:text-black dark:hover:text-white border-b-2 border-transparent'}`}
          >
              {label}
          </button>
      );
  };

  return (
    <nav className="fixed w-full top-0 z-50 bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 cursor-pointer flex items-center" onClick={() => navigate('/dashboard')}>
            <span className="font-extrabold text-lg tracking-[0.2em] uppercase">Nutri<span className="text-zinc-400">Track</span></span>
          </div>
          
          {currentUser && (
              <div className="hidden md:flex items-center gap-6">
                  <NavLink to="/dashboard" label="Overview" />
                  <NavLink to="/logger" label="Log" />
                  <NavLink to="/history" label="Timeline" />
              </div>
          )}

          <div className="flex items-center gap-6">
            <button 
              onClick={toggleTheme} 
              className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
              {isDarkMode ? 'Light' : 'Dark'}
            </button>

            {currentUser && (
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/profile')} className="hover:opacity-80 transition">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      {currentUser.photoURL && <img src={currentUser.photoURL} alt="User" />}
                  </div>
                </button>
                <button onClick={handleLogout} className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white transition hidden sm:block">
                  Exit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
