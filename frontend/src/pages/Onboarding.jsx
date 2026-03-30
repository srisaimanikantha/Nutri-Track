import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

function Onboarding() {
  const { currentUser, refreshDbUser } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('http://localhost:5000/api/user/onboard', formData);
      await refreshDbUser();
      navigate('/dashboard'); 
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: name === 'gender' || name === 'goal' ? value : Number(value) }));
  };

  return (
    <div className="pt-24 px-4 min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-md w-full space-y-6"
      >
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-semibold text-primary">Setup Profile</h2>
          <p className="text-secondary text-sm">Calculate your BMI and macro targets.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-secondary mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="glass-input">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-secondary mb-1">Goal</label>
                <select name="goal" value={formData.goal} onChange={handleChange} className="glass-input">
                    <option value="recomposition">Maintain Weight</option>
                    <option value="weightloss">Lose Weight</option>
                    <option value="bulking">Gain Muscle</option>
                </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
                <label className="block text-xs font-medium text-secondary mb-1">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="glass-input"/>
            </div>
            <div>
                <label className="block text-xs font-medium text-secondary mb-1">Height (cm)</label>
                <input type="number" name="heightCM" value={formData.heightCM} onChange={handleChange} className="glass-input"/>
            </div>
            <div>
                <label className="block text-xs font-medium text-secondary mb-1">Weight (kg)</label>
                <input type="number" name="weightKG" value={formData.weightKG} onChange={handleChange} className="glass-input"/>
            </div>
          </div>

          <button type="submit" disabled={loading} className="glass-button-primary w-full mt-6 py-3 text-sm">
            {loading ? 'Generating...' : 'Continue to Dashboard'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default Onboarding;
