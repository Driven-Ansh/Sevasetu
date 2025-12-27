import React, { useState, useEffect } from 'react';
import { Mic, X, Volume2, CheckCircle, MapPin, Sparkles, Navigation, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { UserSettings } from '../VillagerApp';
import { api } from '../api';
import { toast } from 'sonner';

interface VoiceInputScreenProps {
  onBack: () => void;
  userSettings: UserSettings;
}

const examplePrompts = [
  { text: 'Plastic bottle', emoji: '🍾' },
  { text: 'Food waste', emoji: '🥘' },
  { text: 'Glass jar', emoji: '🫙' },
  { text: 'Old battery', emoji: '🔋' },
  { text: 'Paper waste', emoji: '📄' },
  { text: 'Metal can', emoji: '🥫' },
];

const wasteMapping: Record<string, any> = {
  'plastic': { category: 'Recyclable (Dry)', binColor: 'Blue', type: 'Dry Waste', color: 'from-blue-500 to-blue-600', emoji: '♻️', confidence: 92 },
  'bottle': { category: 'Recyclable (Dry)', binColor: 'Blue', type: 'Dry Waste', color: 'from-blue-500 to-blue-600', emoji: '♻️', confidence: 94 },
  'food': { category: 'Organic (Wet)', binColor: 'Green', type: 'Wet Waste', color: 'from-green-500 to-green-600', emoji: '🌱', confidence: 96 },
  'vegetable': { category: 'Organic (Wet)', binColor: 'Green', type: 'Wet Waste', color: 'from-green-500 to-green-600', emoji: '🌱', confidence: 95 },
  'fruit': { category: 'Organic (Wet)', binColor: 'Green', type: 'Wet Waste', color: 'from-green-500 to-green-600', emoji: '🌱', confidence: 94 },
  'kitchen': { category: 'Organic (Wet)', binColor: 'Green', type: 'Wet Waste', color: 'from-green-500 to-green-600', emoji: '🌱', confidence: 93 },
  'glass': { category: 'Recyclable (Dry)', binColor: 'Blue', type: 'Dry Waste', color: 'from-cyan-500 to-cyan-600', emoji: '🫙', confidence: 90 },
  'jar': { category: 'Recyclable (Dry)', binColor: 'Blue', type: 'Dry Waste', color: 'from-cyan-500 to-cyan-600', emoji: '🫙', confidence: 89 },
  'battery': { category: 'Hazardous', binColor: 'Red', type: 'Hazardous Waste', color: 'from-red-500 to-red-600', emoji: '⚠️', confidence: 98 },
  'metal': { category: 'Recyclable (Dry)', binColor: 'Blue', type: 'Dry Waste', color: 'from-gray-500 to-gray-600', emoji: '🔩', confidence: 91 },
  'can': { category: 'Recyclable (Dry)', binColor: 'Blue', type: 'Dry Waste', color: 'from-gray-500 to-gray-600', emoji: '🔩', confidence: 93 },
  'paper': { category: 'Recyclable (Dry)', binColor: 'Blue', type: 'Dry Waste', color: 'from-blue-500 to-blue-600', emoji: '♻️', confidence: 87 },
  'cardboard': { category: 'Recyclable (Dry)', binColor: 'Blue', type: 'Dry Waste', color: 'from-blue-500 to-blue-600', emoji: '♻️', confidence: 88 },
  'wet': { category: 'Organic (Wet)', binColor: 'Green', type: 'Wet Waste', color: 'from-green-500 to-green-600', emoji: '🌱', confidence: 90 },
  'dry': { category: 'Recyclable (Dry)', binColor: 'Blue', type: 'Dry Waste', color: 'from-blue-500 to-blue-600', emoji: '♻️', confidence: 90 },
  'organic': { category: 'Organic (Wet)', binColor: 'Green', type: 'Wet Waste', color: 'from-green-500 to-green-600', emoji: '🌱', confidence: 92 },
};

export function VoiceInputScreen({ onBack, userSettings }: VoiceInputScreenProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = userSettings.language === 'hindi' ? 'hi-IN' : 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        setPermissionDenied(false);
        handleProcessVoice(speechResult);
      };
      
      recognitionInstance.onerror = (event: any) => {
        // Suppress console error for permission denied (expected behavior)
        if (event.error !== 'not-allowed' && event.error !== 'permission-denied') {
          console.error('Speech recognition error:', event.error);
        }
        
        setIsListening(false);
        
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setPermissionDenied(true);
          setShowPermissionHelp(true);
          toast.error('Microphone permission denied. Using example prompts instead.');
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else if (event.error === 'network') {
          toast.error('Network error. Using offline mode.');
          setVoiceSupported(false);
        } else {
          toast.error('Voice recognition error. Please try typing or select an example.');
        }
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    } else {
      setVoiceSupported(false);
      console.log('Speech recognition not supported in this browser');
      toast.info('Voice not supported in this browser. Use example prompts below.');
    }
  }, [userSettings.language]);

  const handleStartListening = async () => {
    if (permissionDenied) {
      setShowPermissionHelp(true);
      return;
    }

    if (recognition && voiceSupported) {
      try {
        setIsListening(true);
        await recognition.start();
      } catch (error: any) {
        console.error('Failed to start recognition:', error);
        setIsListening(false);
        
        if (error.message?.includes('not-allowed') || error.message?.includes('denied')) {
          setPermissionDenied(true);
          setShowPermissionHelp(true);
          toast.error('Please allow microphone access to use voice input.');
        } else {
          // Fallback to simulated voice input
          simulateVoiceInput();
        }
      }
    } else {
      // Fallback to simulated voice input
      simulateVoiceInput();
    }
  };

  const simulateVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const randomPrompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
      setTranscript(randomPrompt.text);
      handleProcessVoice(randomPrompt.text);
    }, 2000);
  };

  const handleProcessVoice = async (text: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(async () => {
      // Match keywords to categories
      const lowerText = text.toLowerCase();
      let matchedResult = null;
      
      for (const [key, value] of Object.entries(wasteMapping)) {
        if (lowerText.includes(key)) {
          matchedResult = value;
          break;
        }
      }
      
      // Default to dry waste if no match
      if (!matchedResult) {
        matchedResult = wasteMapping['dry'];
      }
      
      const finalResult = {
        ...matchedResult,
        instruction: getInstruction(matchedResult.category),
        binType: getBinType(matchedResult.category, matchedResult.binColor),
      };
      
      setResult(finalResult);
      setIsProcessing(false);
      setShowResult(true);

      // Save to backend
      try {
        await api.createWasteReport({
          userId: userSettings.name,
          type: 'voice',
          category: finalResult.category,
          confidence: finalResult.confidence,
          location: { lat: 27.5667, lng: 80.6833, address: userSettings.village },
          description: text,
        });
      } catch (error) {
        console.error('Error saving waste report:', error);
      }
    }, 2000);
  };

  const getInstruction = (category: string) => {
    const instructions: Record<string, string> = {
      'Recyclable (Dry)': 'Dispose in BLUE recycling bins. Can be recycled into new products.',
      'Organic (Wet)': 'Put in GREEN compost bins. Will turn into fertilizer for crops.',
      'Glass': 'Dispose in BLUE recycling bins. Handle carefully to avoid cuts.',
      'Metal': 'Put in BLUE recycling bins. Can be melted and reused.',
      'Hazardous': 'DANGER! Dispose at special RED hazardous waste collection point.',
    };
    return instructions[category] || instructions['Recyclable (Dry)'];
  };

  const getBinType = (category: string, color: string) => {
    return `${color} Bin - ${category}`;
  };

  const handleTryAgain = () => {
    setTranscript('');
    setResult(null);
    setShowResult(false);
    setShowMap(false);
  };

  const handleShowMap = () => {
    setShowMap(true);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm">
        <button onClick={onBack} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <X className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="font-bold text-gray-900">Voice Input</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-auto">
        {/* Permission Help Banner - Outside AnimatePresence */}
        <AnimatePresence>
          {showPermissionHelp && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 right-0 bg-orange-500 text-white p-4 shadow-lg z-10"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Microphone Permission Needed</h3>
                  <p className="text-sm mb-3 opacity-90">
                    To use voice input, please allow microphone access in your browser settings.
                    Or simply click on an example below to try the AI classification!
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPermissionHelp(false)}
                      className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors duration-200"
                    >
                      Got it
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content - Separate AnimatePresence */}
        <AnimatePresence mode="wait">
          {/* Initial State */}
          {!isListening && !isProcessing && !showResult && (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 flex flex-col items-center justify-center min-h-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl"
              >
                <Mic className="w-16 h-16 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Describe Your Waste</h2>
              <p className="text-gray-600 text-center mb-8">
                Tap the microphone and tell us what waste you have
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartListening}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full px-8 py-4 font-medium shadow-lg hover:shadow-xl transition-all duration-200 mb-8"
              >
                Start Speaking
              </motion.button>

              {/* Example Prompts */}
              <div className="w-full max-w-md">
                <div className="text-sm text-gray-500 mb-3 text-center">Try saying:</div>
                <div className="grid grid-cols-2 gap-3">
                  {examplePrompts.map((prompt, index) => (
                    <motion.button
                      key={prompt.text}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => {
                        setTranscript(prompt.text);
                        handleProcessVoice(prompt.text);
                      }}
                      className="bg-white rounded-xl p-3 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                    >
                      <span className="text-2xl">{prompt.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">{prompt.text}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Listening State */}
          {isListening && (
            <motion.div
              key="listening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 flex flex-col items-center justify-center min-h-full"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-2xl relative"
              >
                <Mic className="w-16 h-16 text-white" />
                
                {/* Pulse rings */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{
                      scale: [1, 2],
                      opacity: [0.5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                    className="absolute inset-0 border-4 border-purple-400 rounded-full"
                  />
                ))}
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Listening...</h2>
              <p className="text-gray-600 text-center">
                Speak clearly about your waste
              </p>

              {/* Waveform animation */}
              <div className="flex items-center gap-1 mt-8">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [20, Math.random() * 60 + 20, 20],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                    className="w-1 bg-purple-500 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 flex flex-col items-center justify-center min-h-full"
            >
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-6"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Processing...</h2>
              
              <div className="bg-white rounded-xl p-4 shadow-lg mb-6 max-w-md">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-500">You said:</span>
                </div>
                <p className="text-lg font-medium text-gray-900">"{transcript}"</p>
              </div>

              <div className="text-green-400 space-y-2 text-center">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  🧠 Understanding your input
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  🔍 Identifying waste category
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  ✨ Finding disposal instructions
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* Result State */}
          {showResult && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-6 pb-24"
            >
              {/* Success Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                Waste Identified!
              </h2>

              {/* Voice Input Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 shadow-md mb-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-500">You said:</span>
                </div>
                <p className="text-lg font-medium text-gray-900">"{transcript}"</p>
              </motion.div>

              {/* Category Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`bg-gradient-to-br ${result.color} rounded-2xl p-6 text-white mb-4`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{result.emoji}</span>
                  <div>
                    <div className="text-2xl font-bold">{result.category}</div>
                    <div className="text-sm opacity-90">Waste Category</div>
                  </div>
                </div>

                <div className="bg-white/20 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">AI Confidence</span>
                    <span className="font-bold">{result.confidence}%</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="bg-white h-2 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Instructions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-5 mb-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Disposal Instructions</h3>
                    <p className="text-sm text-gray-600">{result.instruction}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Correct Bin</div>
                    <div className="font-medium text-gray-900">{result.binType}</div>
                  </div>
                  <button 
                    onClick={handleShowMap}
                    className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Show Map
                  </button>
                </div>
              </motion.div>

              {/* Map View */}
              {showMap && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-5 mb-4"
                >
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-blue-600" />
                    Navigation to Nearest Bin
                  </h3>
                  
                  {/* Simulated Map */}
                  <div className="relative aspect-video bg-gradient-to-br from-green-100 to-blue-100 rounded-xl overflow-hidden mb-3">
                    {/* Current Location Marker */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bottom-1/4 left-1/4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </motion.div>
                    
                    {/* Destination Bin Marker */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className={`absolute top-1/4 right-1/4 w-12 h-12 bg-gradient-to-br ${result.color} rounded-full flex items-center justify-center shadow-xl`}
                    >
                      <span className="text-2xl">{result.emoji}</span>
                    </motion.div>
                    
                    {/* Route Path */}
                    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                      <motion.path
                        d="M 25% 75% Q 50% 25%, 75% 25%"
                        stroke="#3B82F6"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="10,5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, delay: 0.3 }}
                      />
                    </svg>
                    
                    {/* Distance Indicator */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                      <div className="text-xs text-gray-500">Distance</div>
                      <div className="font-bold text-gray-900">140 meters</div>
                    </div>
                    
                    {/* Time Indicator */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                      <div className="text-xs text-gray-500">Walking Time</div>
                      <div className="font-bold text-gray-900">2 minutes</div>
                    </div>
                  </div>
                  
                  {/* Directions */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                      <div className="text-sm text-gray-700">Head north on Main Road</div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                      <div className="text-sm text-gray-700">Turn right near village temple</div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                      <div className="text-sm text-gray-700">{result.binColor} bin on your left</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Points */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 text-center"
              >
                <div className="text-3xl mb-2">🎉</div>
                <div className="font-bold text-gray-900 mb-1">+5 Points Earned!</div>
                <div className="text-sm text-gray-600">Great job identifying waste</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Try Again Button */}
      {showResult && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTryAgain}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl py-4 font-medium shadow-lg"
          >
            Try Another
          </motion.button>
        </div>
      )}
    </div>
  );
}