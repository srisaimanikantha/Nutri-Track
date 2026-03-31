import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
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
  const [mealType, setMealType] = useState('lunch');
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef(null);

  const captureScreenshot = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            setImageFiles(file);
            setPreview(URL.createObjectURL(file));
            setShowCamera(false);
            setScannedItems(null);
          });
    }
  }, [webcamRef]);

  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

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
      const itemsWithMealType = scannedItems.food_items.map(item => ({ ...item, mealType }));

      await axios.post('https://nutri-track-xirg.onrender.com/api/diary/log', {
        userUid: currentUser.uid,
        dateStr: todayStr,
        foodItems: itemsWithMealType,
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
        
        <div className="w-full text-left py-4">
            <label className="block text-xs font-bold tracking-widest uppercase mb-2">Meal Type Slot</label>
            <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="w-full glass border border-zinc-200 dark:border-zinc-800 rounded-md p-4 text-xs font-bold tracking-widest uppercase outline-none focus:border-zinc-400 transition-colors">
                <option value="breakfast" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white pt-2">Breakfast</option>
                <option value="lunch" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">Lunch</option>
                <option value="dinner" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">Dinner</option>
                <option value="snacks" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">Snacks</option>
            </select>
        </div>

        {!preview && !showCamera && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <button onClick={() => setShowCamera(true)} className="glass-card border-zinc-200/50 dark:border-white/20 hover:bg-zinc-200/50 dark:hover:bg-white/10 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-4 py-16 w-full">
                    <span className="text-4xl drop-shadow-md">📸</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white drop-shadow-md">Take Photo</span>
                </button>
                
                <label className="glass-card border-zinc-200/50 dark:border-white/20 hover:bg-zinc-200/50 dark:hover:bg-white/10 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-4 py-16 w-full">
                    <span className="text-4xl drop-shadow-md">📁</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white drop-shadow-md">Upload Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
            </div>
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

      {/* Live Camera Interface */}
      {showCamera && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-lg aspect-video rounded-2xl overflow-hidden glass border-white/20 relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                  <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "environment" }}
                      className="w-full h-full object-cover"
                  />
                  
                  {/* Scope targeting UI crosshair */}
                  <div className="absolute inset-0 border-[2px] border-white/20 m-10 rounded-xl pointer-events-none">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/40 text-[10px] tracking-widest uppercase font-bold text-center">
                         Center Food Here
                     </div>
                  </div>
              </div>
              
              <div className="mt-8 flex gap-4 w-full max-w-lg justify-between">
                  <button onClick={() => setShowCamera(false)} className="px-6 py-4 glass-button w-1/3 uppercase tracking-widest text-[10px]">Cancel</button>
                  <button onClick={captureScreenshot} className="px-8 py-4 glass-button-primary flex-1 uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                     📸 Snap Meal
                  </button>
              </div>
          </div>
      )}
    </div>
  );
}

export default Logger;

