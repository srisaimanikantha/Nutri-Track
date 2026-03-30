import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

function Profile() {
  const { currentUser, dbUser, refreshDbUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    uid: currentUser?.uid || '',
    gender: 'male',
    age: 25,
    heightCM: 175,
    weightKG: 75,
    goal: 'recomposition'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
      if (dbUser) {
          setFormData({
              uid: dbUser.uid,
              gender: dbUser.gender || 'male',
              age: dbUser.age || 25,
              heightCM: dbUser.heightCM || 175,
              weightKG: dbUser.weightKG || 75,
              goal: dbUser.goal || 'recomposition'
          });
      }
  }, [dbUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('http://localhost:5000/api/user/onboard', formData);
      await refreshDbUser();
      navigate('/dashboard'); 
    } catch (err) {
      alert("Failed to save profile.");
    }
    setLoading(false);
  };

  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: name === 'gender' || name === 'goal' ? value : Number(value) }));
  };

  return (
    <div className="pt-28 px-4 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row gap-12">
          {/* Profile Sidebar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 md:w-1/3 h-min border border-zinc-200 dark:border-zinc-800 p-8 rounded-md">
              <img src={currentUser?.photoURL || 'https://via.placeholder.com/150'} alt="Profile" className="w-24 h-24 rounded-full mx-auto grayscale"/>
              <h3 className="text-xl font-bold tracking-widest uppercase">{dbUser?.displayName || 'User'}</h3>
              <div className="border border-black dark:border-white p-2">
                 <p className="font-bold text-xs uppercase tracking-widest">Target Limits</p>
                 <p className="text-sm font-medium mt-1">{dbUser?.targetCalories} kcal / {dbUser?.targetProtein}g P</p>
              </div>
          </motion.div>

          {/* Edit Form */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:w-2/3 space-y-8">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <h2 className="text-2xl font-extrabold tracking-tight">System Preferences</h2>
              <p className="text-secondary text-sm mt-1 uppercase tracking-widest">Modify Biometrics to Recalculate AI Array</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2">Biological Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="glass-input uppercase text-xs">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2">Algorithm Goal</label>
                    <select name="goal" value={formData.goal} onChange={handleChange} className="glass-input uppercase text-xs">
                        <option value="recomposition">Maintain Weight</option>
                        <option value="weightloss">Fat Loss</option>
                        <option value="bulking">Muscle Building</option>
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2">Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="glass-input"/>
                </div>
                <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2">Height (cm)</label>
                    <input type="number" name="heightCM" value={formData.heightCM} onChange={handleChange} className="glass-input"/>
                </div>
                <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2">Weight (kg)</label>
                    <input type="number" name="weightKG" value={formData.weightKG} onChange={handleChange} className="glass-input"/>
                </div>
              </div>

              <button type="submit" disabled={loading} className="glass-button-primary w-full mt-8 py-4 uppercase tracking-widest text-xs">
                {loading ? 'Executing...' : 'Overwrite Targets'}
              </button>
            </form>
          </motion.div>
      </div>
    </div>
  );
}

export default Profile;
