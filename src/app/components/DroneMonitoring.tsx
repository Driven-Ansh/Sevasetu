import React, { useState, useEffect } from 'react';
import { Plane, MapPin, AlertTriangle, TrendingUp, Eye, Play, Square, Radio, Image, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { api } from './api';
import { getTranslation } from './translations';
import { toast } from 'sonner';

interface DroneMonitoringProps {
  language: string;
}

export function DroneMonitoring({ language }: DroneMonitoringProps) {
  const [detections, setDetections] = useState<any[]>([]);
  const [view, setView] = useState<'live' | 'heatmap' | 'insights'>('live');
  const [loading, setLoading] = useState(true);
  const [isDroneActive, setIsDroneActive] = useState(false);
  const [liveDetections, setLiveDetections] = useState<any[]>([]);
  const [droneProgress, setDroneProgress] = useState(0);
  const [selectedDetection, setSelectedDetection] = useState<any>(null);
  const [smsSentCount, setSmsSentCount] = useState(0);

  const t = (key: string) => getTranslation(language, key);

  useEffect(() => {
    fetchDetections();
    // Refresh every 10 seconds
    const interval = setInterval(fetchDetections, 10000);
    return () => clearInterval(interval);
  }, []);

  // Drone testing simulation
  useEffect(() => {
    if (isDroneActive) {
      const interval = setInterval(() => {
        setDroneProgress(prev => {
          if (prev >= 100) {
            setIsDroneActive(false);
            toast.success('Drone scan complete! Check worker portal for new jobs.');
            return 0;
          }
          
          // Generate new detection every 20%
          if (prev % 20 === 0 && prev > 0) {
            generateLiveDetection();
          }
          
          return prev + 1;
        });
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [isDroneActive]);

  const fetchDetections = async () => {
    try {
      const result = await api.getDroneDetections();
      if (result.success) {
        setDetections(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching detections:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLiveDetection = async () => {
    const areas = [
      { name: 'Near Pond', lat: 27.5670, lng: 80.6840, address: 'Village Pond Area, Near Temple' },
      { name: 'Main Road', lat: 27.5665, lng: 80.6830, address: 'Main Road Junction, Near Panchayat Office' },
      { name: 'North Sector', lat: 27.5668, lng: 80.6850, address: 'North Sector, Behind School' },
      { name: 'Village Center', lat: 27.5667, lng: 80.6833, address: 'Village Center Market Area' },
      { name: 'South Gate', lat: 27.5664, lng: 80.6828, address: 'South Gate Entrance, Near Bus Stop' },
    ];
    
    const wasteTypes = [
      ['Plastic', 'Mixed Waste'],
      ['Organic', 'Food Waste'],
      ['Paper', 'Cardboard'],
      ['Metal', 'Cans'],
      ['Plastic Bottles', 'Bags'],
    ];
    
    const severities = ['high', 'medium', 'low'];
    const wasteAmounts = ['Large pile (50+ kg)', 'Medium pile (20-50 kg)', 'Small pile (<20 kg)'];
    
    const wasteImages = [
      'https://images.unsplash.com/photo-1762805545352-4ac5355b0f0b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1641895862407-d4e23bccc950?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1637681316418-dd7a4b6e545e?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1762805543693-5aaa00fadc28?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1758280067999-c820a1055547?w=800&h=600&fit=crop&q=80',
    ];
    
    const randomArea = areas[Math.floor(Math.random() * areas.length)];
    const randomWaste = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)] as 'high' | 'medium' | 'low';
    const randomAmount = wasteAmounts[Math.floor(Math.random() * wasteAmounts.length)];
    const randomImage = wasteImages[Math.floor(Math.random() * wasteImages.length)];
    
    const newDetection = {
      id: `live-${Date.now()}`,
      location: { lat: randomArea.lat, lng: randomArea.lng, area: randomArea.name, address: randomArea.address },
      wasteTypes: randomWaste,
      severity: randomSeverity,
      imageUrl: randomImage,
      area: randomArea.name,
      amount: randomAmount,
      createdAt: new Date().toISOString(),
    };
    
    setLiveDetections(prev => [newDetection, ...prev]);
    
    // Save to backend and create worker job
    try {
      await api.createDroneDetection(newDetection);
      
      // Auto-send SMS to workers
      await sendWorkerSMS(newDetection);
      
      toast.info(`New waste detected at ${randomArea.name}!`, {
        description: `${randomAmount} - SMS sent to workers`,
      });
      fetchDetections();
    } catch (error) {
      console.error('Error saving detection:', error);
    }
  };

  const sendWorkerSMS = async (detection: any) => {
    const smsMessage = {
      id: `sms-${Date.now()}`,
      to: '+91-98XXXXXX01',
      message: `🚨 SevaSetu Alert: Waste detected at ${detection.location.address}. Type: ${detection.wasteTypes.join(', ')}. Amount: ${detection.amount}. Priority: ${detection.severity.toUpperCase()}. Press 1 to accept job, 0 to decline.`,
      jobData: detection,
      timestamp: new Date().toISOString(),
    };
    
    // Store SMS notification in localStorage for Worker App to pick up
    const existingSMS = JSON.parse(localStorage.getItem('workerSMS') || '[]');
    existingSMS.unshift(smsMessage);
    localStorage.setItem('workerSMS', JSON.stringify(existingSMS));
    
    setSmsSentCount(prev => prev + 1);
    
    toast.success('📱 SMS sent to workers!', {
      description: `Notification sent for ${detection.area}`,
    });
  };

  const startDroneTesting = () => {
    setIsDroneActive(true);
    setDroneProgress(0);
    setLiveDetections([]);
    setSmsSentCount(0);
    toast.success('🛸 Drone monitoring started!', {
      description: 'AI scanning for waste accumulation...',
    });
  };

  const stopDroneTesting = () => {
    setIsDroneActive(false);
    setDroneProgress(0);
    toast.info('Drone monitoring stopped.');
  };

  const hotspots = [
    { id: 1, area: 'Near Pond', severity: 'high', types: ['Plastic', 'Mixed'], lat: 27.5670, lng: 80.6840, size: 'large', count: 15 },
    { id: 2, area: 'Main Road', severity: 'medium', types: ['Organic'], lat: 27.5665, lng: 80.6830, size: 'medium', count: 8 },
    { id: 3, area: 'North Sector', severity: 'low', types: ['Paper'], lat: 27.5668, lng: 80.6850, size: 'small', count: 4 },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Drone Monitoring System</h1>
              <p className="text-sm text-gray-500">AI-powered aerial surveillance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isDroneActive ? (
              <button
                onClick={stopDroneTesting}
                className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 shadow-lg"
              >
                <Square className="w-5 h-5" />
                Stop Monitoring
              </button>
            ) : (
              <button
                onClick={startDroneTesting}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-xl transition-all duration-200 shadow-lg animate-pulse"
              >
                <Play className="w-5 h-5" />
                Start Drone Monitoring
              </button>
            )}
            <div className={`flex items-center gap-2 ${isDroneActive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} px-3 py-2 rounded-lg`}>
              <div className={`w-2 h-2 ${isDroneActive ? 'bg-red-500' : 'bg-green-500'} rounded-full ${isDroneActive ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium">{isDroneActive ? 'Scanning' : 'Ready'}</span>
            </div>
          </div>
        </div>

        {/* Drone Progress Bar */}
        {isDroneActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Radio className="w-4 h-4 animate-pulse text-blue-600" />
                Scanning Progress
              </span>
              <span className="text-sm font-medium text-gray-900">{droneProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                style={{ width: `${droneProgress}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <span>✓ AI Detection Active</span>
              <span>📱 {smsSentCount} SMS Sent</span>
            </div>
          </motion.div>
        )}

        {/* View Toggle */}
        <div className="flex gap-2">
          {[
            { id: 'live' as const, label: 'Live Scans', icon: Eye },
            { id: 'heatmap' as const, label: 'Heatmap', icon: MapPin },
            { id: 'insights' as const, label: 'AI Insights', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                  view === tab.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Live Detections Alert */}
        {liveDetections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Radio className="w-6 h-6 text-orange-600 animate-pulse" />
              <h3 className="font-bold text-orange-900">Live Detections ({liveDetections.length})</h3>
              <span className="ml-auto px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
                📱 {smsSentCount} Workers Notified
              </span>
            </div>
            <p className="text-sm text-orange-700 mb-3">New waste areas detected • SMS sent to workers automatically</p>
            <div className="space-y-2 max-h-48 overflow-auto">
              {liveDetections.map((detection, index) => (
                <motion.button
                  key={detection.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedDetection(detection)}
                  className="w-full bg-white rounded-lg p-3 flex items-center justify-between hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      detection.severity === 'high' ? 'bg-red-500 animate-pulse' :
                      detection.severity === 'medium' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`} />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{detection.area}</div>
                      <div className="text-xs text-gray-500">{detection.wasteTypes.join(', ')} • {detection.amount}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-blue-600" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      detection.severity === 'high' ? 'bg-red-100 text-red-700' :
                      detection.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {detection.severity.charAt(0).toUpperCase() + detection.severity.slice(1)}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'live' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detections.length === 0 && liveDetections.length === 0 ? (
              <div className="col-span-2 text-center py-20">
                <Plane className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No waste detected yet</h3>
                <p className="text-gray-500 mb-6">Click "Start Drone Monitoring" to begin scanning</p>
              </div>
            ) : (
              [...liveDetections, ...detections].map((detection, index) => (
                <motion.button
                  key={detection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedDetection(detection)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden text-left"
                >
                  <div className="relative h-48">
                    <img
                      src={detection.imageUrl || 'https://images.unsplash.com/photo-1762805545352-4ac5355b0f0b?w=800&h=600&fit=crop&q=80'}
                      alt="Drone Detection"
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                      detection.severity === 'high' ? 'bg-red-500 text-white' :
                      detection.severity === 'medium' ? 'bg-orange-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {detection.severity?.toUpperCase() || 'MEDIUM'}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{detection.area || detection.location?.area}</h3>
                    <p className="text-sm text-gray-600 mb-3">{detection.location?.address || 'Location data available'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {(detection.wasteTypes || []).slice(0, 2).map((type: string) => (
                          <span key={type} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {type}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(detection.createdAt || detection.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        )}

        {view === 'heatmap' && (
          <div className="space-y-6">
            {/* Village Map with Advanced Heatmap */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">🗺️ Village Waste Heatmap</h2>
                <p className="text-white/90">Real-time waste density visualization across Rampur Village</p>
              </div>

              <div className="relative h-[600px] bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
                {/* Village Road Network */}
                <svg className="absolute inset-0 w-full h-full opacity-30">
                  {/* Main Roads */}
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#94a3b8" strokeWidth="8" strokeDasharray="20,10" />
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#94a3b8" strokeWidth="8" strokeDasharray="20,10" />
                  <line x1="20%" y1="20%" x2="80%" y2="80%" stroke="#cbd5e1" strokeWidth="6" strokeDasharray="15,8" />
                  <line x1="80%" y1="20%" x2="20%" y2="80%" stroke="#cbd5e1" strokeWidth="6" strokeDasharray="15,8" />
                  
                  {/* Secondary Roads */}
                  <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#e2e8f0" strokeWidth="4" strokeDasharray="10,5" />
                  <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#e2e8f0" strokeWidth="4" strokeDasharray="10,5" />
                  <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#e2e8f0" strokeWidth="4" strokeDasharray="10,5" />
                  <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#e2e8f0" strokeWidth="4" strokeDasharray="10,5" />
                </svg>

                {/* Village Landmarks */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute top-[15%] left-[50%] transform -translate-x-1/2 bg-white rounded-xl shadow-lg p-3 border-2 border-orange-400"
                >
                  <div className="text-3xl mb-1">🏛️</div>
                  <div className="text-xs font-bold text-gray-800">Panchayat</div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-[30%] left-[25%] bg-white rounded-xl shadow-lg p-3 border-2 border-blue-400"
                >
                  <div className="text-3xl mb-1">🏫</div>
                  <div className="text-xs font-bold text-gray-800">School</div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute top-[30%] left-[75%] bg-white rounded-xl shadow-lg p-3 border-2 border-purple-400"
                >
                  <div className="text-3xl mb-1">🕌</div>
                  <div className="text-xs font-bold text-gray-800">Temple</div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-[65%] left-[35%] bg-white rounded-xl shadow-lg p-3 border-2 border-green-400"
                >
                  <div className="text-3xl mb-1">💧</div>
                  <div className="text-xs font-bold text-gray-800">Pond</div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute top-[70%] left-[70%] bg-white rounded-xl shadow-lg p-3 border-2 border-pink-400"
                >
                  <div className="text-3xl mb-1">🛒</div>
                  <div className="text-xs font-bold text-gray-800">Market</div>
                </motion.div>

                {/* Advanced Heatmap Hotspots with Better Visualization */}
                {hotspots.map((hotspot, index) => {
                  const positions = [
                    { top: '28%', left: '45%' }, // Near Panchayat
                    { top: '55%', left: '30%' }, // Near Pond
                    { top: '42%', left: '68%' }, // Near Temple
                    { top: '75%', left: '65%' }, // Near Market
                    { top: '48%', left: '52%' }, // Village Center
                  ];
                  
                  const pos = positions[index] || positions[0];
                  
                  return (
                    <motion.div
                      key={hotspot.id}
                      className="absolute"
                      style={{
                        top: pos.top,
                        left: pos.left,
                        transform: 'translate(-50%, -50%)',
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      {/* Pulsing Outer Ring */}
                      <motion.div
                        className={`absolute rounded-full ${
                          hotspot.severity === 'high' ? 'bg-red-500/20' :
                          hotspot.severity === 'medium' ? 'bg-orange-500/20' :
                          'bg-yellow-500/20'
                        }`}
                        style={{
                          width: hotspot.size === 'large' ? '200px' : hotspot.size === 'medium' ? '150px' : '100px',
                          height: hotspot.size === 'large' ? '200px' : hotspot.size === 'medium' ? '150px' : '100px',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0.1, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.5,
                        }}
                      />

                      {/* Blurred Heatmap Effect */}
                      <motion.div
                        className={`absolute rounded-full blur-3xl ${
                          hotspot.severity === 'high' ? 'bg-red-500/50' :
                          hotspot.severity === 'medium' ? 'bg-orange-500/40' :
                          'bg-yellow-500/30'
                        }`}
                        style={{
                          width: hotspot.size === 'large' ? '160px' : hotspot.size === 'medium' ? '120px' : '80px',
                          height: hotspot.size === 'large' ? '160px' : hotspot.size === 'medium' ? '120px' : '80px',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.3,
                        }}
                      />

                      {/* Center Marker */}
                      <motion.div
                        className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transform hover:scale-110 transition-transform shadow-2xl border-4 border-white ${
                          hotspot.severity === 'high' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                          hotspot.severity === 'medium' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                          'bg-gradient-to-br from-yellow-500 to-yellow-600'
                        }`}
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="text-2xl">
                          {hotspot.severity === 'high' ? '🔥' : hotspot.severity === 'medium' ? '⚠️' : '📍'}
                        </div>
                      </motion.div>

                      {/* Info Card on Hover */}
                      <motion.div
                        className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl p-3 min-w-[150px] text-center border-2 ${
                          hotspot.severity === 'high' ? 'border-red-500' :
                          hotspot.severity === 'medium' ? 'border-orange-500' :
                          'border-yellow-500'
                        }`}
                        initial={{ opacity: 0, y: -10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                      >
                        <div className="font-bold text-gray-900 text-sm mb-1">{hotspot.area}</div>
                        <div className="text-xs text-gray-600 mb-1">{hotspot.count} waste items</div>
                        <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                          hotspot.severity === 'high' ? 'bg-red-100 text-red-700' :
                          hotspot.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {hotspot.severity.charAt(0).toUpperCase() + hotspot.severity.slice(1)} Priority
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}

                {/* Drone Flying Animation */}
                <motion.div
                  className="absolute w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 border-blue-500"
                  animate={{
                    left: ['10%', '90%', '90%', '10%', '10%'],
                    top: ['10%', '10%', '90%', '90%', '10%'],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <Plane className="w-6 h-6 text-blue-600" />
                </motion.div>
              </div>

              {/* Legend */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Severity Levels</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-md">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-2xl">
                      🔥
                    </div>
                    <div>
                      <div className="font-bold text-red-700">High Risk</div>
                      <div className="text-xs text-gray-600">Immediate action</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-md">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl">
                      ⚠️
                    </div>
                    <div>
                      <div className="font-bold text-orange-700">Medium</div>
                      <div className="text-xs text-gray-600">Plan cleanup</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-md">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-2xl">
                      📍
                    </div>
                    <div>
                      <div className="font-bold text-yellow-700">Low</div>
                      <div className="text-xs text-gray-600">Monitor</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {view === 'insights' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <h3 className="font-bold text-red-900">Most Affected</h3>
              </div>
              <p className="text-3xl font-bold text-red-900 mb-2">Village Center</p>
              <p className="text-sm text-red-700">3 active hotspots detected</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <h3 className="font-bold text-blue-900">Top Waste Type</h3>
              </div>
              <p className="text-3xl font-bold text-blue-900 mb-2">Plastic</p>
              <p className="text-sm text-blue-700">45% of total waste detected</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
                <h3 className="font-bold text-green-900">Repeat Zones</h3>
              </div>
              <p className="text-3xl font-bold text-green-900 mb-2">2 Locations</p>
              <p className="text-sm text-green-700">Need permanent waste bins</p>
            </Card>
          </div>
        )}
      </div>

      {/* Detection Detail Modal */}
      <AnimatePresence>
        {selectedDetection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDetection(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drone Image Header */}
              <div className="relative">
                <img
                  src={selectedDetection.imageUrl || 'https://images.unsplash.com/photo-1762805545352-4ac5355b0f0b?w=800&h=600&fit=crop&q=80'}
                  alt="Drone Detection"
                  className="w-full h-64 object-cover"
                />
                
                {/* AI Bounding Boxes Overlay */}
                <div className="absolute inset-0 bg-black/20">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1/4 left-1/4 w-32 h-32 border-4 border-red-500 rounded-lg"
                  >
                    <div className="absolute -top-8 left-0 bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                      {selectedDetection.wasteTypes[0]} 94%
                    </div>
                  </motion.div>
                  
                  {selectedDetection.wasteTypes[1] && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute bottom-1/4 right-1/4 w-24 h-24 border-4 border-orange-500 rounded-lg"
                    >
                      <div className="absolute -top-8 left-0 bg-orange-500 text-white px-3 py-1 rounded text-sm font-medium whitespace-nowrap">
                        {selectedDetection.wasteTypes[1]} 87%
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Live Badge */}
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE DETECTION
                </div>
              </div>

              {/* Detection Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedDetection.area}</h2>
                    <p className="text-gray-600">{selectedDetection.location.address}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedDetection.severity === 'high' ? 'bg-red-100 text-red-700' :
                    selectedDetection.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedDetection.severity.toUpperCase()} PRIORITY
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">Waste Type</div>
                    <div className="font-medium text-gray-900">{selectedDetection.wasteTypes.join(', ')}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">Amount Detected</div>
                    <div className="font-medium text-gray-900">{selectedDetection.amount}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">Coordinates</div>
                    <div className="font-medium text-gray-900 text-sm">
                      {selectedDetection.location.lat.toFixed(4)}, {selectedDetection.location.lng.toFixed(4)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">Detection Time</div>
                    <div className="font-medium text-gray-900">{new Date(selectedDetection.createdAt).toLocaleTimeString()}</div>
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-blue-900">AI Analysis</h3>
                  </div>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>✓ Detected {selectedDetection.wasteTypes.length} waste categories with 94% confidence</p>
                    <p>✓ Estimated volume: {selectedDetection.amount}</p>
                    <p>✓ Priority level: {selectedDetection.severity} - immediate action required</p>
                    <p>✓ Worker job automatically created and SMS sent</p>
                  </div>
                </div>

                {/* SMS Notification Status */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Send className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-green-900">Worker Notified</h3>
                  </div>
                  <p className="text-sm text-green-800 mb-2">
                    SMS sent to available workers in the area. Response pending.
                  </p>
                  <div className="text-xs font-mono bg-white border border-green-200 rounded p-2 text-gray-700">
                    🚨 SevaSetu Alert: Waste detected at {selectedDetection.location.address}. 
                    Type: {selectedDetection.wasteTypes.join(', ')}. Amount: {selectedDetection.amount}. 
                    Priority: {selectedDetection.severity.toUpperCase()}. Press 1 to accept job, 0 to decline.
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedDetection(null)}
                    className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Viewing in Worker App...');
                      setSelectedDetection(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl py-3 font-medium hover:shadow-lg transition-all duration-200"
                  >
                    View in Worker App
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