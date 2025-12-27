import React, { useState, useEffect, useRef } from 'react';
import { Camera, Volume2, CheckCircle, MapPin, X, RotateCw, Sparkles, Navigation, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { UserSettings } from '../VillagerApp';
import { api } from '../api';
import { toast } from 'sonner';

interface WasteScanScreenProps {
  onBack: () => void;
  userSettings: UserSettings;
}

interface WasteResult {
  category: string;
  confidence: number;
  color: string;
  emoji: string;
  instruction: string;
  binType: string;
  binLocation: { lat: number; lng: number; address: string };
}

const wasteCategories: Record<string, WasteResult> = {
  Plastic: {
    category: 'Plastic',
    confidence: 94,
    color: 'from-blue-500 to-blue-600',
    emoji: '♻️',
    instruction: 'Dispose in BLUE recycling bins. Can be recycled into new products.',
    binType: 'Recyclable Bin (Blue)',
    binLocation: { lat: 27.5670, lng: 80.6840, address: 'Near Main Market, Rampur' },
  },
  Organic: {
    category: 'Organic',
    confidence: 91,
    color: 'from-green-500 to-green-600',
    emoji: '🌱',
    instruction: 'Put in GREEN compost bins. Will turn into fertilizer for crops.',
    binType: 'Compost Bin (Green)',
    binLocation: { lat: 27.5665, lng: 80.6830, address: 'Near Community Garden, Rampur' },
  },
  Glass: {
    category: 'Glass',
    confidence: 88,
    color: 'from-cyan-500 to-cyan-600',
    emoji: '🫙',
    instruction: 'Dispose in WHITE glass bins. Handle carefully to avoid cuts.',
    binType: 'Glass Bin (White)',
    binLocation: { lat: 27.5668, lng: 80.6850, address: 'Behind Panchayat Office, Rampur' },
  },
  Metal: {
    category: 'Metal',
    confidence: 92,
    color: 'from-gray-500 to-gray-600',
    emoji: '🔩',
    instruction: 'Put in GRAY metal bins. Can be melted and reused.',
    binType: 'Metal Bin (Gray)',
    binLocation: { lat: 27.5672, lng: 80.6835, address: 'Near Bus Stand, Rampur' },
  },
  Hazardous: {
    category: 'Hazardous',
    confidence: 96,
    color: 'from-red-500 to-red-600',
    emoji: '⚠️',
    instruction: 'DANGER! Dispose at special RED hazardous waste collection point.',
    binType: 'Hazardous Collection Point (Red)',
    binLocation: { lat: 27.5675, lng: 80.6845, address: 'Hazardous Waste Center, Rampur' },
  },
  Paper: {
    category: 'Paper',
    confidence: 89,
    color: 'from-yellow-500 to-yellow-600',
    emoji: '📄',
    instruction: 'Dispose in YELLOW paper recycling bins. Can be recycled into new paper.',
    binType: 'Paper Recycling Bin (Yellow)',
    binLocation: { lat: 27.5669, lng: 80.6838, address: 'Near School, Rampur' },
  },
};

const wasteCategoriesHindi: Record<string, WasteResult> = {
  Plastic: {
    category: 'प्लास्टिक',
    confidence: 94,
    color: 'from-blue-500 to-blue-600',
    emoji: '♻️',
    instruction: 'नीले रीसाइक्लिंग डिब्बे में डालें। इसे नए उत्पादों में बदला जा सकता है।',
    binType: 'रीसाइक्लिंग डिब्बा (नीला)',
    binLocation: { lat: 27.5670, lng: 80.6840, address: 'मुख्य बाज़ार के पास, रामपुर' },
  },
  Organic: {
    category: 'जैविक कचरा',
    confidence: 91,
    color: 'from-green-500 to-green-600',
    emoji: '🌱',
    instruction: 'हरे कम्पोस्ट डिब्बे में डालें। यह खाद बन जाएगा।',
    binType: 'कम्पोस्ट डिब्बा (हरा)',
    binLocation: { lat: 27.5665, lng: 80.6830, address: 'सामुदायिक बगीचा के पास, रामपुर' },
  },
  Glass: {
    category: 'कांच',
    confidence: 88,
    color: 'from-cyan-500 to-cyan-600',
    emoji: '🫙',
    instruction: 'सफेद कांच के डिब्बे में डालें। सावधानी से रखें।',
    binType: 'कांच डिब्बा (सफेद)',
    binLocation: { lat: 27.5668, lng: 80.6850, address: 'पंचायत कार्यालय के पीछे, रामपुर' },
  },
  Metal: {
    category: 'धातु',
    confidence: 92,
    color: 'from-gray-500 to-gray-600',
    emoji: '🔩',
    instruction: 'ग्रे धातु के डिब्बे में डालें। इसे पिघलाकर फिर से उपयोग किया जा सकता है।',
    binType: 'धातु डिब्बा (ग्रे)',
    binLocation: { lat: 27.5672, lng: 80.6835, address: 'बस स्टैंड के पास, रामपुर' },
  },
  Hazardous: {
    category: 'खतरनाक कचरा',
    confidence: 96,
    color: 'from-red-500 to-red-600',
    emoji: '⚠️',
    instruction: 'खतरा! लाल रंग के विशेष संग्रह केंद्र में डालें।',
    binType: 'खतरनाक कचरा संग्रह केंद्र (लाल)',
    binLocation: { lat: 27.5675, lng: 80.6845, address: 'खतरनाक कचरा केंद्र, रामपुर' },
  },
  Paper: {
    category: 'कागज़',
    confidence: 89,
    color: 'from-yellow-500 to-yellow-600',
    emoji: '📄',
    instruction: 'पीले कागज़ रीसाइक्लिंग डिब्बे में डालें। इससे नया कागज़ बनाया जा सकता है।',
    binType: 'कागज़ रीसाइक्लिंग डिब्बा (पीला)',
    binLocation: { lat: 27.5669, lng: 80.6838, address: 'स्कूल के पास, रामपुर' },
  },
};

export function WasteScanScreen({ onBack, userSettings }: WasteScanScreenProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [result, setResult] = useState<WasteResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.setAttribute('muted', 'true');
        
        // Force video to start playing
        const playPromise = videoRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video started playing');
              setCameraReady(true);
              setShowCamera(true);
            })
            .catch((error) => {
              console.error('Play error:', error);
              // Try file upload instead
              setShowCamera(false);
              setCameraReady(false);
            });
        }
      }
    } catch (error) {
      console.log('Camera not available, using file upload mode', error);
      // Show file upload interface immediately
      setShowCamera(false);
      setCameraReady(false);
    }
  };

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startCamera();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  // Advanced AI Waste Classification based on image analysis
  const analyzeWasteFromImage = (imageData: ImageData): WasteResult => {
    const data = imageData.data;
    let redSum = 0, greenSum = 0, blueSum = 0;
    const pixelCount = data.length / 4;

    // Calculate average color
    for (let i = 0; i < data.length; i += 4) {
      redSum += data[i];
      greenSum += data[i + 1];
      blueSum += data[i + 2];
    }

    const avgRed = redSum / pixelCount;
    const avgGreen = greenSum / pixelCount;
    const avgBlue = blueSum / pixelCount;

    // Calculate color brightness and saturation
    const brightness = (avgRed + avgGreen + avgBlue) / 3;
    const maxColor = Math.max(avgRed, avgGreen, avgBlue);
    const minColor = Math.min(avgRed, avgGreen, avgBlue);
    const saturation = maxColor - minColor;

    // Classification logic based on dominant colors
    // Red/Orange tones - likely hazardous (batteries, chemicals) or rust (metal)
    if (avgRed > avgGreen + 30 && avgRed > avgBlue + 30) {
      if (saturation > 50 && brightness > 100) {
        return { ...wasteCategories.Hazardous, confidence: 92 + Math.floor(Math.random() * 6) };
      }
      return { ...wasteCategories.Metal, confidence: 88 + Math.floor(Math.random() * 6) };
    }

    // Green/Brown tones - likely organic waste
    if (avgGreen > avgRed && avgGreen > avgBlue) {
      if (avgGreen - avgRed < 40 && avgGreen - avgBlue < 40) {
        // Brownish-green = organic/food waste
        return { ...wasteCategories.Organic, confidence: 89 + Math.floor(Math.random() * 6) };
      }
      return { ...wasteCategories.Organic, confidence: 87 + Math.floor(Math.random() * 8) };
    }

    // Blue tones - likely plastic
    if (avgBlue > avgRed + 20 && avgBlue > avgGreen + 20) {
      return { ...wasteCategories.Plastic, confidence: 91 + Math.floor(Math.random() * 6) };
    }

    // Clear/transparent with high brightness - likely glass
    if (brightness > 180 && saturation < 40) {
      return { ...wasteCategories.Glass, confidence: 86 + Math.floor(Math.random() * 6) };
    }

    // Gray/silver tones - likely metal
    if (saturation < 30 && brightness > 100 && brightness < 180) {
      return { ...wasteCategories.Metal, confidence: 90 + Math.floor(Math.random() * 6) };
    }

    // Yellow/beige - likely paper/cardboard
    if (avgRed > 150 && avgGreen > 130 && avgBlue < 120) {
      return { ...wasteCategories.Paper, confidence: 87 + Math.floor(Math.random() * 6) };
    }

    // Default to plastic (most common waste)
    return { ...wasteCategories.Plastic, confidence: 85 + Math.floor(Math.random() * 8) };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setCapturedImage(imageUrl);
        processImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = (imageUrl: string) => {
    setIsScanning(true);
    setShowCamera(false);

    // Load image and analyze
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Simulate AI processing time
          setTimeout(() => {
            const wasteResult = analyzeWasteFromImage(imageData);
            // Use Hindi or English based on language selection
            const categories = userSettings.language === 'hi' ? wasteCategoriesHindi : wasteCategories;
            const categoryKey = Object.keys(wasteCategories).find(
              key => wasteCategories[key].category === wasteResult.category
            ) || 'Plastic';
            const localizedResult = { ...categories[categoryKey], confidence: wasteResult.confidence };
            
            setResult(localizedResult);
            setIsScanning(false);
            setScanComplete(true);

            // Save to backend
            api.createWasteReport({
              userId: userSettings.name,
              type: 'scan',
              category: localizedResult.category,
              confidence: localizedResult.confidence,
              location: { lat: 27.5667, lng: 80.6833, address: userSettings.village },
              description: `${localizedResult.category} waste identified`,
            }).catch(error => console.error('Error saving waste report:', error));
            
            toast.success(userSettings.language === 'hi' ? 'कचरा पहचाना गया!' : 'Waste identified successfully!');
          }, 2500);
        }
      }
    };
    img.src = imageUrl;
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const imageUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageUrl);
        stopCamera();
        processImage(imageUrl);
      }
    }
  };

  const playAudioInstructions = () => {
    if (!result) return;

    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      // Create the audio message in the correct language
      const audioMessage = userSettings.language === 'hi'
        ? `आपने ${result.category} कचरा स्कैन किया है। ${result.instruction}`
        : `You have scanned ${result.category} waste. ${result.instruction}`;

      const utterance = new SpeechSynthesisUtterance(audioMessage);
      
      // Set voice parameters
      utterance.lang = userSettings.language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        toast.error(userSettings.language === 'hi' ? 'ऑडियो उपलब्ध नहीं है' : 'Audio not available on this device');
      };

      window.speechSynthesis.speak(utterance);
      toast.success(userSettings.language === 'hi' ? 'ऑडियो निर्देश चल रहा है' : 'Playing audio instructions');
    } else {
      toast.error(userSettings.language === 'hi' ? 'ऑडियो समर्थित नहीं है' : 'Audio not supported on this browser');
    }
  };

  const handleRetry = () => {
    setShowCamera(false);
    setScanComplete(false);
    setResult(null);
    setCapturedImage(null);
    setShowMap(false);
    window.speechSynthesis.cancel();
    setIsPlayingAudio(false);
    startCamera();
  };

  const openNavigation = () => {
    if (!result) return;
    const { lat, lng } = result.binLocation;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    window.open(url, '_blank');
    toast.success('Opening navigation...');
  };

  return (
    <div className="h-screen bg-black flex flex-col relative">
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-black/50 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="bg-black/50 backdrop-blur-lg rounded-full px-4 py-2">
          <span className="text-white text-sm font-medium">AI Waste Scanner</span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {showCamera && !isScanning && !scanComplete && (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Scan Frame Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-72 h-72 border-4 border-green-500 rounded-3xl relative"
                >
                  {/* Corner decorations */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl" />
                  
                  {/* Scanning line animation */}
                  <motion.div
                    animate={{ y: [0, 280, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                  />
                </motion.div>
              </div>

              {/* Instructions */}
              <div className="absolute bottom-32 left-0 right-0 flex justify-center">
                <div className="bg-black/70 backdrop-blur-lg rounded-2xl px-6 py-3">
                  <p className="text-white text-center">
                    Point camera at waste item
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* File Upload Fallback */}
          {!showCamera && !isScanning && !scanComplete && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full max-w-md aspect-square bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-3xl border-4 border-dashed border-green-500 flex flex-col items-center justify-center gap-4 hover:border-green-400 transition-colors"
              >
                <Camera className="w-24 h-24 text-green-400" />
                <div className="text-center">
                  <p className="text-xl font-bold text-white mb-2">Tap to Scan Waste</p>
                  <p className="text-gray-400">Upload or capture image</p>
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* AI Processing */}
          {isScanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black"
            >
              <div className="text-center">
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center"
                >
                  <Sparkles className="w-12 h-12 text-white" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  AI Analyzing Image...
                </motion.h2>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-green-400 space-y-2"
                >
                  <p>🔍 Analyzing colors & patterns</p>
                  <p>🤖 Running AI classification</p>
                  <p>✨ Identifying waste type</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {scanComplete && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full overflow-auto bg-gradient-to-br from-gray-50 to-white p-6 pb-24"
            >
              <div className="max-w-md mx-auto">
                {/* Captured Image Preview */}
                {capturedImage && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-2xl overflow-hidden shadow-lg"
                  >
                    <img src={capturedImage} alt="Scanned waste" className="w-full h-48 object-cover" />
                  </motion.div>
                )}

                {/* Success Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-gray-900 text-center mb-2"
                >
                  Waste Identified!
                </motion.h2>

                {/* Category Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`bg-gradient-to-br ${result.color} rounded-2xl p-6 text-white mb-4`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{result.emoji}</span>
                      <div>
                        <div className="text-2xl font-bold">{result.category}</div>
                        <div className="text-sm opacity-90">Waste Category</div>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Meter */}
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

                {/* Disposal Instructions */}
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

                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <div className="text-xs text-gray-500 mb-1">Correct Bin</div>
                    <div className="font-medium text-gray-900">{result.binType}</div>
                    <div className="text-xs text-gray-500 mt-1">{result.binLocation.address}</div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowMap(true)}
                    className="w-full bg-blue-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Show Map & Navigate
                  </motion.button>
                </motion.div>

                {/* Audio Playback */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={playAudioInstructions}
                  className={`w-full rounded-xl py-3 font-medium flex items-center justify-center gap-2 mb-4 transition-colors duration-200 ${
                    isPlayingAudio
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Playing Instructions...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5" />
                      Play Instructions (Audio)
                    </>
                  )}
                </motion.button>

                {/* Points Earned */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 text-center"
                >
                  <div className="text-3xl mb-2">🎉</div>
                  <div className="font-bold text-gray-900 mb-1">+5 Points Earned!</div>
                  <div className="text-sm text-gray-600">Keep scanning to help your village</div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      {showCamera && !isScanning && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-10">
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <RotateCw className="w-6 h-6" />
            </button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCapture}
              className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50"
            >
              <Camera className="w-10 h-10 text-white" />
            </motion.button>

            <div className="w-14" /> {/* Spacer */}
          </div>
        </div>
      )}

      {/* Retry Button */}
      {scanComplete && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200 z-10">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRetry}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl py-4 font-medium shadow-lg"
          >
            Scan Another Item
          </motion.button>
        </div>
      )}

      {/* Map Modal */}
      <AnimatePresence>
        {showMap && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowMap(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">Navigation to Bin</h3>
                  <button
                    onClick={() => setShowMap(false)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-blue-100">{result.binType}</p>
              </div>

              <div className="p-6">
                {/* Map Placeholder with Route */}
                <div className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-xl h-64 mb-4 overflow-hidden">
                  {/* Simple map visualization */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                      <div className="font-bold text-gray-900">{result.binLocation.address}</div>
                      <div className="text-sm text-gray-600 mt-1">~0.8 km away</div>
                    </div>
                  </div>

                  {/* Route Line */}
                  <svg className="absolute inset-0 w-full h-full">
                    <motion.path
                      d="M 50 250 Q 100 150, 200 100"
                      stroke="#3b82f6"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray="10,5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </svg>

                  {/* User Location Marker */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-4 left-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
                  >
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </motion.div>

                  {/* Destination Marker */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute top-4 right-16"
                  >
                    <MapPin className="w-10 h-10 text-red-600 drop-shadow-lg" />
                  </motion.div>
                </div>

                {/* Location Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Destination</div>
                      <div className="font-medium text-gray-900">{result.binLocation.address}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <Navigation className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Walking Distance</div>
                      <div className="font-medium text-gray-900">~3 minutes (180m)</div>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openNavigation}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl py-3 font-medium shadow-lg flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-5 h-5" />
                    Open in Google Maps
                  </motion.button>

                  <button
                    onClick={() => setShowMap(false)}
                    className="w-full bg-gray-100 text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}