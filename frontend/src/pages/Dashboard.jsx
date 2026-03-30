import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import ChatBot from '../components/ChatBot';

function Dashboard() {
  const { currentUser, dbUser } = useAuth();
  const [logs, setLogs] = useState([]);
  
  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const todayLog = logs.find(log => log.dateStr === todayStr);
  const consumedCalories = todayLog ? todayLog.totalCalories : 0;
  const consumedProtein = todayLog ? todayLog.totalProtein : 0;
  
  const targetCalories = dbUser?.targetCalories || 2000;
  const targetProtein = dbUser?.targetProtein || 120;
  
  const caloriePercent = Math.min((consumedCalories / targetCalories) * 100, 100);
  const proteinPercent = Math.min((consumedProtein / targetProtein) * 100, 100);

  useEffect(() => {
    fetchHistory();
  }, [currentUser]);

  const fetchHistory = async () => {
    if (!currentUser) return;
    try {
      const res = await axios.get(`https://nutri-track-xirg.onrender.com/api/diary/history/${currentUser.uid}`);
      setLogs(res.data.logs);
    } catch (err) {
      console.error(err);
    }
  };

  const resetToday = async () => {
      if(!window.confirm("Are you sure you want to reset all data for today?")) return;
      try {
          await axios.delete(`https://nutri-track-xirg.onrender.com/api/diary/today/${currentUser.uid}`);
          fetchHistory();
      } catch(err) {
          alert('Failed to reset');
      }
  };

  return (
    <div className="pt-28 px-4 max-w-4xl mx-auto space-y-12 pb-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end border-b border-black dark:border-white pb-6">
         <div>
             <h1 className="text-4xl font-extrabold tracking-tight">Daily Overview</h1>
             <p className="text-secondary mt-2">Metrics for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}</p>
         </div>
         {consumedCalories > 0 && (
             <button onClick={resetToday} className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition">Reset Today</button>
         )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Calories Block */}
        <div className="flex flex-col flex-shrink-0 w-full p-6 glass-card">
           <div className="flex justify-between w-full mb-4 font-bold text-sm tracking-widest uppercase">
               <span>Calories</span>
               <span>{consumedCalories} / {targetCalories}</span>
           </div>
           <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
               <motion.div 
                   initial={{ width: 0 }} animate={{ width: `${caloriePercent}%` }}
                   className={`h-full bg-gradient-to-r from-red-500 to-rose-400`}
               />
           </div>
           <p className="text-xs text-secondary mt-4 font-medium uppercase tracking-widest">
               {targetCalories - consumedCalories > 0 ? `${targetCalories - consumedCalories} Remaining` : 'Limit Reached'}
           </p>
        </div>

        {/* Protein Block */}
        <div className="flex flex-col flex-shrink-0 w-full p-6 glass-card">
           <div className="flex justify-between w-full mb-4 font-bold text-sm tracking-widest uppercase">
               <span>Protein</span>
               <span>{consumedProtein} / {targetProtein}g</span>
           </div>
           <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
               <motion.div 
                   initial={{ width: 0 }} animate={{ width: `${proteinPercent}%` }}
                   className="h-full bg-gradient-to-r from-red-500 to-rose-400"
               />
           </div>
           <p className="text-xs text-secondary mt-4 font-medium uppercase tracking-widest">
               {targetProtein - consumedProtein > 0 ? `${targetProtein - consumedProtein}g Goal Remaining` : 'Goal Accomplished'}
           </p>
        </div>
      </motion.div>
      <ChatBot />
    </div>
  );
}

export default Dashboard;

