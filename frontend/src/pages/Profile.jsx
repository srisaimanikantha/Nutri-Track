import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Profile() {
  const { currentUser, dbUser, refreshDbUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
      await logout();
      navigate('/');
  };

  const [formData, setFormData] = useState({
    userId: dbUser?._id || '',
    gender: 'male',
    age: 25,
    heightCM: 175,
    weightKG: 75,
    targetWeightKG: '',
    goal: 'recomposition',
    activityLevel: 'sedentary'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
      if (dbUser) {
          setFormData({
              userId: dbUser._id,
              gender: dbUser.gender || 'male',
              age: dbUser.age || 25,
              heightCM: dbUser.heightCM || 175,
              weightKG: dbUser.weightKG || 75,
              targetWeightKG: dbUser.targetWeightKG || '',
              goal: dbUser.goal || 'recomposition',
              activityLevel: dbUser.activityLevel || 'sedentary'
          });
      }
  }, [dbUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/user/onboard`, formData);
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
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2">Algorithm Goal</label>
                    <select name="goal" value={formData.goal} onChange={handleChange} className="glass-input uppercase text-xs">
                        <option value="recomposition">Maintain Weight</option>
                        <option value="weightloss">Fat Loss</option>
                        <option value="bulking">Muscle Building</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2">Weekly Activity</label>
                    <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="glass-input uppercase text-xs">
                        <option value="sedentary">Sedentary (No Exercise)</option>
                        <option value="light">Lightly (1–3 days/week)</option>
                        <option value="moderate">Moderate (3–5 days/week)</option>
                        <option value="very">Very Active (6–7 days/week)</option>
                        <option value="super">Super Active (Intense)</option>
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

              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Target Advice</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {formData.goal === 'weightloss' && "To achieve fat loss, we've set a 500-calorie deficit. Focus on high protein to preserve muscle mass while losing weight."}
                  {formData.goal === 'bulking' && "For muscle gain, a 400-calorie surplus is targeted. Ensure you hit your protein goals to support hypertrophy."}
                  {formData.goal === 'recomposition' && "Maintenance mode focuses on body recomposition. Keep your intake steady while training to balance fat loss and muscle gain."}
                </p>
              </div>

              {formData.goal !== 'recomposition' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                      <label className="block text-xs font-bold tracking-widest uppercase mb-2 text-emerald-400">Target Weight Goal (kg)</label>
                      <input type="number" name="targetWeightKG" value={formData.targetWeightKG || ''} onChange={handleChange} className="glass-input focus:ring-emerald-400 border-emerald-400/30" placeholder={`Expected weight for ${formData.goal === 'weightloss' ? 'fat loss' : 'muscle gain'}`}/>
                  </motion.div>
              )}

              <button type="submit" disabled={loading} className="glass-button-primary w-full mt-8 py-4 uppercase tracking-widest text-xs">
                {loading ? 'Executing...' : 'Overwrite Targets'}
              </button>

              <button 
                type="button" 
                onClick={handleLogout} 
                className="w-full mt-4 py-4 uppercase tracking-widest text-xs font-bold border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
               >
                Sign Out
              </button>
            </form>
          </motion.div>
      </div>
    </div>
  );
}

export default Profile;

