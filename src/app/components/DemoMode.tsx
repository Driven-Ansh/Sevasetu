import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ChevronRight, SkipForward, RotateCcw, CheckCircle, Brain, Zap, MapPin, TrendingUp, Target } from 'lucide-react';
import { getTranslation } from './translations';

interface DemoModeProps {
  language?: string;
}

export function DemoMode({ language = 'en' }: DemoModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const t = (key: string) => getTranslation(language, key);

  const demoSteps = [
    {
      id: 1,
      title: '📱 Villager Multi-Modal Report',
      description: 'Villager uses voice + photo to report waste. Even voice-only works!',
      icon: '📸',
      color: 'from-blue-500 to-blue-600',
      details: [
        '🗣️ Voice input: "कूड़ा जमा है बाज़ार के पास" (Waste near market)',
        '📸 Photo taken simultaneously (multi-modal AI)',
        '🤖 AI recognizes: Plastic bottles, organic waste',
        '📍 Location auto-captured via GPS',
        '⚡ Report submitted in 8 seconds',
      ],
      visual: (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 flex flex-col items-center justify-center">
          <div className="text-5xl mb-3">📱</div>
          <div className="w-64 h-80 bg-white rounded-2xl shadow-xl flex flex-col p-4 relative overflow-hidden">
            {/* Voice wave animation */}
            <div className="flex items-center gap-2 bg-blue-50 border-2 border-blue-300 rounded-xl p-3 mb-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-2xl"
              >
                🎤
              </motion.div>
              <div className="flex-1">
                <div className="text-xs font-bold text-blue-900">Voice Recording...</div>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [8, 20, 8] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-blue-500 rounded"
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Camera feed */}
            <div className="flex-1 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl"
              >
                📸
              </motion.div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-0 left-0 h-1 bg-green-500"
              />
            </div>
            
            <div className="mt-3 text-center">
              <div className="font-bold text-gray-900 text-sm">AI Multi-Modal Analysis</div>
              <div className="text-xs text-gray-600">Voice + Photo = 95% accuracy</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: '🧠 Weak Signal Added to AI Map',
      description: 'Report becomes a "weak signal" (35% confidence) on the AI inference map',
      icon: '🔍',
      color: 'from-indigo-500 to-indigo-600',
      details: [
        '📍 Location plotted on AI inference map',
        '🔵 Appears as small blue dot (weak signal)',
        '📊 Confidence: 35% (individually weak)',
        '⏰ Timestamp: Saved for spatio-temporal analysis',
        '🧠 AI begins correlating with other signals',
      ],
      visual: (
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-xl relative overflow-hidden border-2 border-gray-200">
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-8 grid-rows-8 h-full">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="border border-gray-400" />
                  ))}
                </div>
              </div>
              
              {/* New weak signal appearing */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.5, 1],
                  opacity: [0, 0.7, 0.5]
                }}
                transition={{ duration: 2 }}
                className="absolute w-6 h-6 rounded-full bg-blue-400"
                style={{ left: '45%', top: '40%' }}
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-blue-400"
                />
              </motion.div>
              
              {/* Confidence label */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute left-1/2 top-1/3 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold"
              >
                35% confidence
              </motion.div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-900">
                <Zap className="w-4 h-4 inline mr-1" />
                <strong>Weak signal added!</strong> Individually not actionable, but AI will merge with others.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: '⚡ AI Spatio-Temporal Inference',
      description: 'AI merges 4 weak signals → Creates high-confidence hotspot (81%)',
      icon: '🧠',
      color: 'from-purple-500 to-purple-600',
      details: [
        '🔍 AI detects 4 signals within 50m radius',
        '🧩 Signals: Voice report, photo, worker movement, historical pattern',
        '📈 Confidence builds: 35% + 28% + 22% + 42% → 81%',
        '🔥 Hotspot forms with high confidence',
        '⚡ Spatio-temporal ML makes this possible',
      ],
      visual: (
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="text-5xl mb-2 inline-block"
              >
                🧠
              </motion.div>
              <div className="font-bold text-gray-900 text-lg">AI Inference Processing</div>
            </div>
            
            {/* Signal merging visualization */}
            <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-xl relative overflow-hidden border-2 border-gray-200 mb-4">
              {/* Multiple weak signals converging */}
              {[
                { x: 35, y: 30, delay: 0, conf: 35 },
                { x: 55, y: 35, delay: 0.3, conf: 28 },
                { x: 50, y: 50, delay: 0.6, conf: 22 },
                { x: 40, y: 55, delay: 0.9, conf: 42 },
              ].map((signal, idx) => (
                <motion.div
                  key={idx}
                  initial={{ 
                    left: `${signal.x}%`, 
                    top: `${signal.y}%`,
                    scale: 0.5,
                    opacity: 0.4
                  }}
                  animate={{ 
                    left: '45%', 
                    top: '45%',
                    scale: 0,
                    opacity: 0
                  }}
                  transition={{ delay: signal.delay, duration: 1.5 }}
                  className="absolute w-4 h-4 rounded-full bg-blue-400"
                  style={{ transform: 'translate(-50%, -50%)' }}
                >
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-blue-600 whitespace-nowrap">
                    {signal.conf}%
                  </span>
                </motion.div>
              ))}
              
              {/* Resulting hotspot */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8 }}
                transition={{ delay: 2 }}
                className="absolute w-20 h-20 rounded-full bg-red-500"
                style={{ left: '45%', top: '45%', transform: 'translate(-50%, -50%)' }}
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 2.5 }}
                  className="absolute inset-0 rounded-full border-4 border-red-500"
                />
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                  81%
                </div>
              </motion.div>
            </div>
            
            <div className="p-3 bg-purple-50 border-2 border-purple-300 rounded-lg">
              <p className="text-sm text-purple-900 font-semibold">
                <Brain className="w-4 h-4 inline mr-1" />
                AI merged 4 weak signals → High confidence hotspot!
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: '🤔 Explainable AI Reasoning',
      description: 'AI shows transparent reasoning chain explaining WHY it identified this hotspot',
      icon: '💡',
      color: 'from-yellow-500 to-yellow-600',
      details: [
        '1️⃣ 4 independent reports within 50m radius',
        '2️⃣ Near road bend (common dumping spot pattern)',
        '3️⃣ Historical data shows 80% recurrence here',
        '4️⃣ Market day today → High waste generation',
        '5️⃣ Temperature 32°C → Faster decomposition urgency',
      ],
      visual: (
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🤔</div>
              <div className="font-bold text-gray-900 text-lg">Why AI Decided This</div>
              <div className="text-sm text-gray-600">Explainability = Trust</div>
            </div>
            
            <div className="space-y-2 mb-4">
              {[
                '4 independent signals within 50m',
                'Near road bend (pattern)',
                'Historical 80% recurrence',
                'Market day = high waste',
                'Temp 32°C = urgent action',
              ].map((reason, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.3 }}
                  className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-700 flex-1">{reason}</p>
                </motion.div>
              ))}
            </div>
            
            <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-xl">
              <p className="text-sm font-bold text-yellow-900">
                ⚡ Why AI is Essential: Humans cannot manually process and correlate these signals across space, time, and context.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: '🔮 Predictive Alert (Tomorrow)',
      description: 'AI predicts TOMORROW\'s waste hotspot before it appears! Prevention > Reaction',
      icon: '🔮',
      color: 'from-orange-500 to-orange-600',
      details: [
        '🔮 Time-series ML predicts tomorrow\'s hotspot',
        '📍 Location: Temple Road (festival pattern detected)',
        '📊 Confidence: 73% waste will accumulate',
        '⏰ Timeframe: Tomorrow 8-10 AM',
        '🎯 Recommendation: Pre-emptive cleanup scheduled',
      ],
      visual: (
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">🔮</div>
              <div className="font-bold text-gray-900 text-lg">Predictive Alert</div>
              <div className="text-sm text-orange-600 font-semibold">Predicting Tomorrow's Waste TODAY</div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-400 rounded-xl mb-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-3xl">⚠️</div>
                <div className="flex-1">
                  <h4 className="font-bold text-orange-900 mb-1">Tomorrow 8-10 AM</h4>
                  <p className="text-sm text-orange-800">Temple Road Junction</p>
                </div>
                <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  73%
                </div>
              </div>
              
              <div className="space-y-1 mb-3">
                <p className="text-xs text-orange-900">
                  <strong>Why:</strong> Festival pattern + Historical data + Weather correlation
                </p>
                <p className="text-xs text-orange-900">
                  <strong>Expected waste:</strong> Organic, Flowers, Plastic
                </p>
              </div>
              
              <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-sm font-bold text-green-900">
                  🎯 Recommended: Schedule pre-emptive cleanup at 7 AM
                </p>
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 border-2 border-purple-300 rounded-lg">
              <p className="text-sm font-bold text-purple-900">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Prevention &gt; Reaction: AI predicts waste BEFORE it appears!
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: '🗺️ AI-Optimized Worker Routing',
      description: 'AI creates optimal route for 3 hotspots. 35% faster than manual routing!',
      icon: '🎯',
      color: 'from-cyan-500 to-cyan-600',
      details: [
        '🧮 Traveling Salesman Problem (TSP) solver',
        '📍 Optimizes sequence: Hotspot A → B → C',
        '⏱️ AI route: 12 minutes | Manual route: 18 minutes',
        '💰 35% time savings = More jobs completed',
        '📱 Worker gets turn-by-turn directions',
      ],
      visual: (
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🗺️</div>
              <div className="font-bold text-gray-900 text-lg">Route Optimization</div>
            </div>
            
            {/* Route comparison */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                <div className="text-xs text-red-900 font-bold mb-1">Manual Route</div>
                <div className="text-2xl font-bold text-red-600">18 min</div>
                <div className="text-xs text-red-700">Random sequence</div>
              </div>
              <div className="p-3 bg-green-50 border-2 border-green-500 rounded-lg">
                <div className="text-xs text-green-900 font-bold mb-1">AI Route</div>
                <div className="text-2xl font-bold text-green-600">12 min</div>
                <div className="text-xs text-green-700">TSP optimized</div>
              </div>
            </div>
            
            {/* Map visualization */}
            <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-xl relative overflow-hidden border-2 border-gray-200 mb-3">
              {/* Hotspots */}
              {[
                { x: 30, y: 30, label: 'A' },
                { x: 70, y: 40, label: 'B' },
                { x: 50, y: 70, label: 'C' },
              ].map((spot, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.3 }}
                  className="absolute w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-white"
                  style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {spot.label}
                </motion.div>
              ))}
              
              {/* Optimized path */}
              <motion.svg
                className="absolute inset-0 w-full h-full"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 1 }}
              >
                <motion.path
                  d="M 30% 30% L 50% 70% L 70% 40%"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 1 }}
                />
              </motion.svg>
              
              {/* Worker icon */}
              <motion.div
                initial={{ left: '30%', top: '30%' }}
                animate={{ 
                  left: ['30%', '50%', '70%'],
                  top: ['30%', '70%', '40%']
                }}
                transition={{ duration: 3, delay: 2 }}
                className="absolute text-2xl"
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                👷
              </motion.div>
            </div>
            
            <div className="p-3 bg-green-50 border-2 border-green-400 rounded-lg">
              <p className="text-sm font-bold text-green-900">
                <Target className="w-4 h-4 inline mr-1" />
                35% time savings! AI routing = More villages served per day
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: '📱 Worker Receives Smart Job',
      description: 'Worker gets AI-optimized job via SMS with all details and navigation',
      icon: '📱',
      color: 'from-blue-500 to-blue-600',
      details: [
        '📱 SMS notification sent to worker phone',
        '📍 Job details: Location, waste type, priority',
        '🗺️ AI-optimized route with turn-by-turn directions',
        '📸 Before photo upload required',
        '⏱️ ETA prediction: 8 minutes to reach',
      ],
      visual: (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 flex items-center justify-center">
          <div className="w-56 max-w-full">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-[3px] border-gray-800">
              <div className="bg-gray-800 text-white p-1.5 text-center text-[10px] font-medium">
                Worker Phone
              </div>
              <div className="p-2.5 bg-gray-50">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-green-100 rounded-lg rounded-tl-none p-2.5 mb-2"
                >
                  <div className="font-bold text-green-900 mb-1.5 text-xs">🚨 AI-Optimized Job</div>
                  <div className="text-[10px] text-gray-800 space-y-0.5">
                    <div><strong>Location:</strong> Near Main Market</div>
                    <div><strong>Type:</strong> Plastic + Organic</div>
                    <div><strong>Confidence:</strong> 81% (High)</div>
                    <div><strong>ETA:</strong> 3 minutes</div>
                    <div className="pt-1.5">
                      <a href="#" className="text-blue-600 underline text-[10px]">📍 AI Route (12 min total)</a>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="flex gap-1.5"
                >
                  <button className="flex-1 bg-green-500 text-white rounded-md py-1.5 text-[10px] font-medium">
                    Accept & Navigate
                  </button>
                  <button className="flex-1 bg-gray-300 text-gray-700 rounded-md py-1.5 text-[10px] font-medium">
                    Decline
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 8,
      title: '✅ Job Completed & AI Verified',
      description: 'Worker completes cleanup. AI verifies before/after photos automatically.',
      icon: '✅',
      color: 'from-green-500 to-green-600',
      details: [
        '📸 Before photo: Waste accumulation detected',
        '🧹 Worker cleans area (15 minutes)',
        '📸 After photo: AI verifies cleanliness (92% clean)',
        '✅ Job auto-approved by computer vision',
        '🎯 Hotspot confidence drops from 81% → 12%',
      ],
      visual: (
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-16 h-16 text-white" />
            </motion.div>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-gray-900 mb-1">Job Completed!</div>
              <div className="text-sm text-gray-600">AI verified cleanup quality</div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="aspect-square bg-red-100 rounded-xl flex flex-col items-center justify-center p-2 border-2 border-red-300">
                <div className="text-3xl mb-1">📸</div>
                <div className="text-xs font-bold text-red-900">Before</div>
                <div className="text-xs text-red-700">Waste detected</div>
              </div>
              <div className="aspect-square bg-green-100 rounded-xl flex flex-col items-center justify-center p-2 border-2 border-green-500">
                <div className="text-3xl mb-1">✨</div>
                <div className="text-xs font-bold text-green-900">After</div>
                <div className="text-xs text-green-700">92% clean</div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
              <div className="text-sm text-green-800">
                <strong>Time taken:</strong> 15 minutes<br />
                <strong>Waste collected:</strong> 5.2 kg<br />
                <strong>AI verification:</strong> Approved ✅
              </div>
            </div>
            <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <p className="text-sm font-bold text-blue-900">
                Hotspot confidence: 81% → 12% (Resolved!)
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 9,
      title: '🧠 AI Learns & Improves',
      description: 'AI updates its model with new data. Prediction accuracy improves 65% → 85%+',
      icon: '📈',
      color: 'from-purple-500 to-purple-600',
      details: [
        '📊 Feedback loop: Action outcome → Model update',
        '🧠 AI learns: Market area = high accuracy pattern',
        '📈 Prediction accuracy: 65% → 67% → 72% → 85%+',
        '🔄 Continuous learning = Better predictions',
        '🌍 Knowledge scales across all villages',
      ],
      visual: (
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-5xl mb-2 inline-block"
              >
                🧠
              </motion.div>
              <div className="font-bold text-gray-900 text-lg">AI Learning in Progress</div>
              <div className="text-sm text-gray-600">Continuous model improvement</div>
            </div>
            
            {/* Learning metrics */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between bg-gradient-to-r from-red-50 to-green-50 rounded-xl p-3 border-2 border-green-300">
                <div>
                  <div className="text-sm text-gray-600">Prediction Accuracy</div>
                  <div className="text-2xl font-bold text-green-600">65% → 85%</div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="text-3xl"
                >
                  📈
                </motion.div>
              </div>
              
              <div className="flex items-center justify-between bg-blue-50 rounded-xl p-3 border-2 border-blue-300">
                <div>
                  <div className="text-sm text-gray-600">Pattern Recognition</div>
                  <div className="text-2xl font-bold text-blue-600">+342 patterns</div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: 'spring' }}
                  className="text-3xl"
                >
                  🧩
                </motion.div>
              </div>
              
              <div className="flex items-center justify-between bg-purple-50 rounded-xl p-3 border-2 border-purple-300">
                <div>
                  <div className="text-sm text-gray-600">Villages Managed</div>
                  <div className="text-2xl font-bold text-purple-600">1 → 1000+</div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: 'spring' }}
                  className="text-3xl"
                >
                  🌍
                </motion.div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-xl">
              <p className="text-sm font-bold text-yellow-900 mb-2">
                🔄 Feedback Loop: Data → Patterns → Predictions → Actions → Outcomes → Model Updates
              </p>
              <p className="text-xs text-yellow-800">
                AI scales infinitely without hardware. Drones cannot learn or scale like this!
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 10,
      title: '📊 Panchayat Dashboard Updated',
      description: 'Admin sees real-time metrics, AI learning progress, and scalability proof',
      icon: '📊',
      color: 'from-indigo-500 to-indigo-600',
      details: [
        '📊 Cleanliness score: 78% → 79% (improving)',
        '🔥 Active hotspots: 3 → 2 (reducing)',
        '✅ Jobs completed today: 28 → 29',
        '🧠 AI accuracy: 65% → 85% (learning visible)',
        '🌍 Scalability: Same AI manages 1000+ villages',
      ],
      visual: (
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">📊</div>
              <div className="font-bold text-gray-900 text-lg">Dashboard Real-Time Update</div>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between bg-green-50 rounded-xl p-3 border-2 border-green-300">
                <div>
                  <div className="text-sm text-gray-600">Cleanliness Score</div>
                  <div className="text-2xl font-bold text-green-600">78% → 79%</div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="text-2xl"
                >
                  ⬆️
                </motion.div>
              </div>
              <div className="flex items-center justify-between bg-red-50 rounded-xl p-3 border-2 border-red-300">
                <div>
                  <div className="text-sm text-gray-600">Active Hotspots</div>
                  <div className="text-2xl font-bold text-red-600">3 → 2</div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: 'spring' }}
                  className="text-2xl"
                >
                  ⬇️
                </motion.div>
              </div>
              <div className="flex items-center justify-between bg-blue-50 rounded-xl p-3 border-2 border-blue-300">
                <div>
                  <div className="text-sm text-gray-600">AI Prediction Accuracy</div>
                  <div className="text-2xl font-bold text-blue-600">85%</div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: 'spring' }}
                  className="text-2xl"
                >
                  🧠
                </motion.div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400 rounded-xl">
              <p className="text-sm font-bold text-purple-900 mb-2">
                🌍 Zero-Hardware Scalability
              </p>
              <p className="text-xs text-purple-800">
                Same AI inference engine manages 1 village or 1000 villages. No drones, no cameras, infinite scale!
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = demoSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">🎬 SevaSetu AI Demo Mode</h1>
              <p className="text-xl opacity-90">Complete AI Inference Engine Workflow</p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-75 mb-1">Step {currentStep + 1} of {demoSteps.length}</div>
              <div className="w-48 bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {demoSteps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(idx)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  idx === currentStep
                    ? 'bg-white text-purple-900'
                    : idx < currentStep
                    ? 'bg-green-500/30 text-white'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {s.icon} {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Visual */}
          <motion.div
            key={`visual-${currentStep}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
          >
            {step.visual}
          </motion.div>

          {/* Right: Details */}
          <motion.div
            key={`details-${currentStep}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${step.color} text-white text-sm font-medium mb-4`}>
              Step {currentStep + 1} of {demoSteps.length}
            </div>

            <h2 className="text-3xl font-bold mb-3">{step.title}</h2>
            <p className="text-xl opacity-90 mb-6">{step.description}</p>

            <div className="space-y-3 mb-8">
              {step.details.map((detail, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3 bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-sm flex-1">{detail}</p>
                </motion.div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl p-4 font-medium transition-all"
              >
                ← Previous
              </button>
              <button
                onClick={nextStep}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-xl p-4 font-medium transition-all"
              >
                {currentStep === demoSteps.length - 1 ? '🔄 Restart' : 'Next →'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black/30 backdrop-blur-sm border-t border-white/20 p-4 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm opacity-75">
            🚀 <strong>Key Insight:</strong> AI Inference Engine scales infinitely without hardware. 
            Drones cost ₹50k-2L each and serve ~5 villages. AI serves 1000+ villages with ZERO hardware!
          </p>
        </div>
      </div>
    </div>
  );
}