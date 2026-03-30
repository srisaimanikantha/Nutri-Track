import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Logger() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [imageFiles, setImageFiles] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scannedItems, setScannedItems] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFiles(file);
      setPreview(URL.createObjectURL(file));
      setScannedItems(null);
    }
  };

  const scanFood = async () => {
    if (!imageFiles) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFiles);
      const aiResponse = await axios.post('https://nutri-track-xirg.onrender.com/api/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const items = aiResponse.data.food_items;
      if (!items || items.length === 0) {
          alert("Couldn't detect any food.");
      } else {
          setScannedItems(aiResponse.data);
      }
    } catch (err) {
      alert('Failed to process meal.');
    }
    setLoading(false);
  };

  const logMeal = async () => {
    if (!scannedItems) return;
    setLoading(true);
    try {
      await axios.post('https://nutri-track-xirg.onrender.com/api/diary/log', {
        userUid: currentUser.uid,
        dateStr: todayStr,
        foodItems: scannedItems.food_items,
        totalCalories: scannedItems.total_calories,
        totalProtein: scannedItems.total_protein
      });
      navigate('/history');
    } catch (e) {
      alert("Error saving meal.");
    }
    setLoading(false);
  };

  return (
    <div className="pt-28 px-4 max-w-2xl mx-auto space-y-12 pb-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold tracking-tight">Log Entry</h2>
        <p className="text-secondary">Capture your meal for analysis.</p>
        
        {!preview && (
            <label className="border hover:bg-zinc-50 dark:hover:bg-[#121214] border-zinc-200 dark:border-zinc-800 rounded-md p-20 cursor-pointer w-full transition-colors flex flex-col items-center justify-center">
                <span className="text-sm font-bold uppercase tracking-widest text-secondary">Click to Select Image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
        )}

        {preview && !scannedItems && (
            <div className="space-y-6 w-full mt-8">
                <img src={preview} alt="Meal Preview" className="w-full aspect-video object-cover mx-auto rounded-md shadow-sm border border-zinc-200 dark:border-zinc-800"/>
                <div className="flex gap-4 justify-center">
                    <button onClick={() => setPreview(null)} disabled={loading} className="glass-button px-6 py-2">Discard</button>
                    <button onClick={scanFood} disabled={loading} className="glass-button-primary px-8 py-2">
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
            </div>
        )}

        {scannedItems && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-8 mt-8">
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
                    <div className="flex justify-between font-bold text-sm tracking-widest uppercase border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
                        <span>Analysis</span>
                        <span>{scannedItems.total_calories} kcal / {scannedItems.total_protein}g P</span>
                    </div>

                    <div className="space-y-4 text-left">
                        {scannedItems.food_items.map((food, idx) => (
                            <div key={idx} className="flex justify-between text-sm items-center">
                                <div><span className="font-bold">{food.name}</span> <span className="text-secondary ml-1">({food.quantity})</span></div>
                                <div className="font-medium">{food.calories} kcal <span className="text-secondary ml-1">— {food.protein}g</span></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    <button onClick={() => {setPreview(null); setScannedItems(null)}} disabled={loading} className="glass-button px-6 py-3">Discard</button>
                    <button onClick={logMeal} disabled={loading} className="glass-button-primary px-10 py-3 uppercase tracking-widest text-sm">
                        {loading ? 'Saving...' : 'Commit to Log'}
                    </button>
                </div>
            </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default Logger;
