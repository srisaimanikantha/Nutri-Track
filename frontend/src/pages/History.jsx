import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

function History() {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  
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

  const deleteLog = async (id) => {
      if(!window.confirm("Delete this log completely?")) return;
      try {
          await axios.delete(`https://nutri-track-xirg.onrender.com/api/diary/log/${id}`);
          fetchHistory();
      } catch (err) {
          alert("Could not delete log.");
      }
  };

  return (
    <div className="pt-28 px-4 max-w-3xl mx-auto space-y-12 pb-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-black dark:border-white pb-6">
         <h1 className="text-4xl font-extrabold tracking-tight">Timeline</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-8">
          {logs.length === 0 ? (
              <div className="text-center py-12 text-secondary text-sm uppercase tracking-widest">No entries available.</div>
          ) : (
              logs.map((log) => (
                  <div key={log._id} className="border border-zinc-200 dark:border-zinc-800 p-6 rounded-md space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
                          <span className="font-extrabold tracking-widest uppercase text-sm">{log.dateStr}</span>
                          <div className="flex items-center gap-4">
                              <span className="font-bold text-sm">
                                    {log.totalCalories} kcal / {log.totalProtein}g P
                              </span>
                              <button onClick={() => deleteLog(log._id)} className="text-red-500 hover:text-red-700 font-bold px-2 py-1 text-xs uppercase tracking-widest border border-red-500 hover:bg-red-500/10 rounded transition">Delete</button>
                          </div>
                      </div>
                      
                      <div className="space-y-3 pt-2">
                          {log.foodItems.map((food, idx) => (
                              <div key={idx} className="flex justify-between py-1 text-sm bg-zinc-50 dark:bg-[#121214] px-4 rounded border border-zinc-100 dark:border-zinc-800/50">
                                  <div className="font-bold">{food.name} <span className="text-secondary ml-2 font-normal">({food.quantity})</span></div>
                                  <div className="font-medium">
                                        {food.calories} kcal <span className="text-secondary ml-2">{food.protein}g</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              ))
          )}
      </motion.div>
    </div>
  );
}

export default History;
