import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

function Login() {
  const { loginWithGoogle, dbUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (dbUser) {
      if (!dbUser.hasCompletedOnboarding) navigate('/onboard');
      else navigate('/dashboard');
    }
  }, [dbUser, navigate]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Login Failed', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm w-full text-center space-y-12"
      >
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-[0.2em] uppercase text-white">
            Nutri<span className="text-zinc-400">Track</span>
          </h1>
          <p className="text-zinc-300 dark:text-zinc-400 text-sm tracking-widest uppercase">System Authentication</p>
        </div>

        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-4 py-4 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors uppercase tracking-widest font-bold text-xs"
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google" 
            className="w-4 h-4" 
          />
          Authenticate
        </button>

      </motion.div>
    </div>
  );
}

export default Login;

