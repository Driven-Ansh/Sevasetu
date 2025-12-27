import React, { useState, useRef } from 'react';
import { Camera, Mic, MapPin, CheckCircle, Loader, X, Sparkles, Image as ImageIcon, Zap, Upload, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { UserSettings } from '../VillagerApp';
import { api } from '../api';
import { toast } from 'sonner';

interface ReportScreenProps {
  userSettings: UserSettings;
}

export function ReportScreen({ userSettings }: ReportScreenProps) {
  const [step, setStep] = useState<'input' | 'camera' | 'analyzing' | 'submitting' | 'success'>('input');
  const [method, setMethod] = useState<'photo' | 'voice' | 'both'>('photo');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setStep('analyzing');
        
        // Simulate AI analysis
        setTimeout(() => {
          const wasteTypes = [
            { type: 'Plastic Bottles', confidence: 94, icon: '🍾' },
            { type: 'Food Waste', confidence: 87, icon: '🥗' },
            { type: 'Paper/Cardboard', confidence: 92, icon: '📦' },
            { type: 'Metal Cans', confidence: 78, icon: '🥫' },
          ];
          
          const randomWaste = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
          const suggestions = {
            wasteType: randomWaste.type,
            confidence: randomWaste.confidence,
            icon: randomWaste.icon,
            suggestedPriority: Math.random() > 0.5 ? 'high' : 'medium',
            estimatedVolume: Math.random() > 0.5 ? 'Large pile (30-50kg)' : 'Medium pile (10-30kg)',
            recyclable: Math.random() > 0.5,
            aiDescription: `Detected ${randomWaste.type.toLowerCase()} waste accumulation. ${Math.random() > 0.5 ? 'Blocking pathway, immediate removal recommended.' : 'Regular waste disposal needed.'}`,
          };
          
          setAiSuggestions(suggestions);
          setPriority(suggestions.suggestedPriority as 'low' | 'medium' | 'high');
          setDescription(suggestions.aiDescription);
          setStep('input');
          
          toast.success('AI Analysis Complete!', {
            description: `${randomWaste.confidence}% confidence - ${randomWaste.type}`,
          });
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    toast.info('Listening...', {
      description: 'Speak in Hindi or English',
    });

    // Simulate voice recognition
    setTimeout(() => {
      const voiceDescriptions = [
        'बहुत सारा कचरा पड़ा है सड़क पर - Lot of plastic waste on the road',
        'गंदगी फैली हुई है - Mixed waste near pond area',
        'सड़क के किनारे कूड़ा - Garbage pile by roadside',
      ];
      const randomDesc = voiceDescriptions[Math.floor(Math.random() * voiceDescriptions.length)];
      setDescription(randomDesc);
      setIsListening(false);
      toast.success('Voice captured!');
    }, 2000);
  };

  const handleSubmit = async () => {
    setStep('submitting');
    
    try {
      await api.createLitterReport({
        reporterId: userSettings.name,
        location: { lat: 27.5667, lng: 80.6833, address: userSettings.village + ' - Near main road' },
        description: description || 'Litter found in public area',
        priority,
        imageUrl: capturedImage,
        aiAnalysis: aiSuggestions,
      });

      setTimeout(() => {
        setStep('success');
        toast.success('Report submitted successfully!');
      }, 1500);
    } catch (error) {
      console.error('Error submitting report:', error);
      setStep('success'); // Show success anyway for demo
    }
  };

  // AI Analyzing Animation
  if (step === 'analyzing') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6 overflow-hidden">
        {/* Animated Background Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative z-10"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
              scale: { duration: 1.5, repeat: Infinity },
            }}
            className="w-32 h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-2xl"
          >
            <Sparkles className="w-16 h-16 text-white" />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2 relative z-10"
        >
          AI Analyzing Image...
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 mb-6 relative z-10"
        >
          Identifying waste type and priority
        </motion.p>

        <div className="w-64 bg-white rounded-full h-2 overflow-hidden shadow-lg relative z-10">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-sm text-gray-500 flex items-center gap-2 relative z-10"
        >
          <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
          Powered by Advanced AI Vision
        </motion.div>
      </div>
    );
  }

  if (step === 'submitting') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-6">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1, repeat: Infinity },
          }}
          className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-6 shadow-2xl"
        >
          <Loader className="w-12 h-12 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submitting Report...</h2>
        <p className="text-gray-600">Notifying cleaning team & creating worker job</p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6 overflow-hidden">
        {/* Confetti Animation */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'][i % 4],
            }}
            initial={{
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
              scale: 0,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: [0, 1, 0],
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 2,
              delay: i * 0.05,
            }}
          />
        ))}

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 200,
            damping: 15,
          }}
          className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-2xl relative z-10"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <CheckCircle className="w-20 h-20 text-white" />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-2 text-center relative z-10"
        >
          🎉 Amazing Work!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 text-center mb-6 relative z-10"
        >
          Cleaning team has been notified via SMS
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 relative z-10"
        >
          {/* Points Reward */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="text-center mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-300"
          >
            <div className="text-6xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
              +15 Points!
            </div>
            <div className="text-sm text-gray-600 mt-2">You're a SevaSetu Champion!</div>
          </motion.div>

          {/* Report Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Report ID:</span>
              <span className="font-mono font-bold text-gray-900">#LTR{Date.now().toString().slice(-4)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Status:</span>
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Worker Assigned
              </motion.span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Priority:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                priority === 'high' ? 'bg-red-100 text-red-700' :
                priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </span>
            </div>

            {aiSuggestions && (
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-bold text-purple-900">AI Detection</span>
                </div>
                <div className="text-sm text-purple-800 flex items-center gap-2">
                  <span className="text-2xl">{aiSuggestions.icon}</span>
                  {aiSuggestions.wasteType} ({aiSuggestions.confidence}% confidence)
                </div>
              </div>
            )}
          </div>

          {/* Impact Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600 mb-3">Your Impact This Month</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-700">12</div>
                <div className="text-xs text-gray-600">Reports</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-700">85</div>
                <div className="text-xs text-gray-600">Points</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-700">#3</div>
                <div className="text-xs text-gray-600">Rank</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-3 mt-6 relative z-10">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setStep('input');
              setDescription('');
              setCapturedImage(null);
              setAiSuggestions(null);
            }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl px-8 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Report Another
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toast.info('Viewing leaderboard...')}
            className="bg-white text-gray-700 rounded-xl px-8 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-gray-200"
          >
            Leaderboard
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 pb-20 overflow-auto">
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <motion.div 
            className="w-20 h-20 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
            }}
          >
            <span className="text-4xl">🚩</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-2">
            Report Waste
          </h1>
          <p className="text-gray-600">Help keep your village clean with AI-powered reporting</p>
        </motion.div>

        {/* Method Selection with Better UI */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { id: 'photo' as const, icon: Camera, label: 'Photo', gradient: 'from-blue-500 to-blue-600' },
            { id: 'voice' as const, icon: Mic, label: 'Voice', gradient: 'from-purple-500 to-purple-600' },
            { id: 'both' as const, icon: Sparkles, label: 'Both', gradient: 'from-pink-500 to-orange-500' },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <motion.button
                key={m.id}
                onClick={() => setMethod(m.id)}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-2xl transition-all duration-200 ${
                  method === m.id
                    ? `bg-gradient-to-br ${m.gradient} text-white shadow-2xl`
                    : 'bg-white text-gray-700 shadow-md'
                }`}
              >
                <motion.div
                  animate={method === m.id ? { rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className="w-8 h-8 mx-auto mb-2" />
                </motion.div>
                <div className="font-bold text-sm">{m.label}</div>
              </motion.button>
            );
          })}
        </div>

        {/* AI Suggestions Banner */}
        <AnimatePresence>
          {aiSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-6 h-6" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="font-bold">AI Detection Result</div>
                    <div className="text-xs opacity-90">{aiSuggestions.confidence}% confidence</div>
                  </div>
                  <button
                    onClick={() => setAiSuggestions(null)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{aiSuggestions.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{aiSuggestions.wasteType}</div>
                      <div className="text-sm opacity-90">{aiSuggestions.estimatedVolume}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <div className={`px-3 py-1 rounded-full ${aiSuggestions.recyclable ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                    {aiSuggestions.recyclable ? '♻️ Recyclable' : '🚫 Non-Recyclable'}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/20">
                    Priority: {aiSuggestions.suggestedPriority.toUpperCase()}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo/Voice Input Area with Advanced UI */}
        <motion.div 
          className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {!capturedImage ? (
            <div className="p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCameraCapture}
                className="hidden"
              />
              
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full aspect-video bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl flex flex-col items-center justify-center border-4 border-dashed border-blue-300 hover:border-blue-500 transition-all duration-200 mb-4"
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Camera className="w-16 h-16 text-blue-500 mb-3" />
                </motion.div>
                <p className="text-lg font-bold text-gray-900 mb-1">📸 Tap to Capture Waste</p>
                <p className="text-sm text-gray-600">AI will automatically identify waste type</p>
              </motion.button>

              {(method === 'voice' || method === 'both') && (
                <motion.button
                  onClick={handleVoiceInput}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isListening}
                  className={`w-full p-6 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                    isListening
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      : 'bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-dashed border-purple-300 hover:border-purple-500'
                  }`}
                >
                  <motion.div
                    animate={isListening ? { 
                      scale: [1, 1.3, 1],
                    } : {}}
                    transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
                  >
                    <Mic className={`w-12 h-12 mb-3 ${isListening ? 'text-white' : 'text-purple-500'}`} />
                  </motion.div>
                  <p className={`text-lg font-bold mb-1 ${isListening ? 'text-white' : 'text-gray-900'}`}>
                    {isListening ? '🎤 Listening...' : '🗣️ Tap to Describe in Hindi/English'}
                  </p>
                  {isListening && (
                    <div className="flex gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 h-8 bg-white rounded-full"
                          animate={{ 
                            scaleY: [1, 2, 1],
                          }}
                          transition={{ 
                            duration: 0.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </motion.button>
              )}
            </div>
          ) : (
            <div className="relative">
              <img 
                src={capturedImage} 
                alt="Captured waste"
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setCapturedImage(null);
                    setAiSuggestions(null);
                  }}
                  className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>
              </div>
              {aiSuggestions && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{aiSuggestions.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{aiSuggestions.wasteType}</div>
                      <div className="text-xs text-gray-600">{aiSuggestions.confidence}% AI Confidence</div>
                    </div>
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-6 pt-0">
            <textarea
              placeholder="Additional details or corrections (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none resize-none text-gray-900 placeholder-gray-400"
              rows={3}
            />
          </div>
        </motion.div>

        {/* Location with Better Design */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-4 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <MapPin className="w-7 h-7 text-white" />
            </motion.div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Current Location</div>
              <div className="font-bold text-gray-900 text-lg">{userSettings.village}</div>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                GPS Accurate • Near main road
              </div>
            </div>
          </div>
        </motion.div>

        {/* Priority Selection with Enhanced UI */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Priority Level
          </div>
          <div className="grid grid-cols-3 gap-3">
            {([
              { id: 'low' as const, label: 'Low', icon: '🟢', gradient: 'from-blue-500 to-blue-600' },
              { id: 'medium' as const, label: 'Medium', icon: '🟡', gradient: 'from-orange-500 to-orange-600' },
              { id: 'high' as const, label: 'High', icon: '🔴', gradient: 'from-red-500 to-red-600' },
            ]).map((p) => (
              <motion.button
                key={p.id}
                onClick={() => setPriority(p.id)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`py-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                  priority === p.id
                    ? `bg-gradient-to-br ${p.gradient} text-white shadow-2xl`
                    : 'bg-gray-100 text-gray-600 shadow-md'
                }`}
              >
                <div className="text-2xl mb-1">{p.icon}</div>
                {p.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Submit Button with Advanced Animation */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-2xl py-5 font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-200 relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ x: '-100%', opacity: 0.3 }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Zap className="w-6 h-6" />
            Submit Report & Earn Points
          </span>
        </motion.button>

        {/* Enhanced Info Box */}
        <motion.div 
          className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-blue-600" />
            </motion.div>
            <div>
              <p className="text-sm text-blue-900 font-medium mb-1">
                💡 <strong>Pro Tip:</strong> Use AI photo analysis for instant waste identification!
              </p>
              <p className="text-xs text-blue-700">
                Clear photos help AI detect waste type, estimate volume, and set priority automatically.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}