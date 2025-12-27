import React, { useState, useEffect } from 'react';
import { Plane, MapPin, AlertTriangle, TrendingUp, Eye, Play, Square, Radio, Image, Send } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { api } from './api';
import { getTranslation } from './translations';
import { toast } from 'sonner';

interface DroneDashboardProps {
  language: string;
}

export function DroneDashboard({ language }: DroneDashboardProps) {
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
    
    const randomArea = areas[Math.floor(Math.random() * areas.length)];
    const randomWaste = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)] as 'high' | 'medium' | 'low';
    const randomAmount = wasteAmounts[Math.floor(Math.random() * wasteAmounts.length)];
    
    const newDetection = {
      id: `live-${Date.now()}`,
      location: { lat: randomArea.lat, lng: randomArea.lng, area: randomArea.name, address: randomArea.address },
      wasteTypes: randomWaste,
      severity: randomSeverity,
      imageUrl: `https://images.unsplash.com/photo-${1560272564 + Math.floor(Math.random() * 100)}-${Math.random().toString(36).substr(2, 9)}?w=400&h=300&fit=crop`, // Simulated drone image
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
      to: '+91-98XXXXXX01',
      message: `🚨 GaonSweep Alert: Waste detected at ${detection.location.address}. Type: ${detection.wasteTypes.join(', ')}. Amount: ${detection.amount}. Priority: ${detection.severity.toUpperCase()}. Press 1 to accept job, 0 to decline.`,
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
    { id: 1, area: 'Near Pond', severity: 'high', types: ['Plastic', 'Mixed'], lat: 27.5670, lng: 80.6840, size: 'large' },
    { id: 2, area: 'Main Road', severity: 'medium', types: ['Organic'], lat: 27.5665, lng: 80.6830, size: 'medium' },
    { id: 3, area: 'North Sector', severity: 'low', types: ['Paper'], lat: 27.5668, lng: 80.6850, size: 'small' },
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Live Scan Cards */}
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {/* Simulated Drone Image */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl opacity-50">🛸</div>
                  </div>
                  
                  {/* AI Bounding Boxes */}
                  {i === 1 && (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute top-1/4 left-1/4 w-24 h-24 border-4 border-red-500 rounded-lg"
                      >
                        <div className="absolute -top-8 left-0 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Plastic 94%
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7 }}
                        className="absolute bottom-1/4 right-1/4 w-20 h-16 border-4 border-orange-500 rounded-lg"
                      >
                        <div className="absolute -top-8 left-0 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                          Mixed 87%
                        </div>
                      </motion.div>
                    </>
                  )}

                  {/* Live Badge */}
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>

                  {/* Timestamp */}
                  <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">Scan #{i.toString().padStart(3, '0')}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      i === 1 ? 'bg-red-100 text-red-700' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {i === 1 ? 'High' : i === 2 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{hotspots[i - 1].area}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {hotspots[i - 1].types.map((type, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Create Detection Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={async () => {
                // Create a new detection
                try {
                  await api.createDroneDetection({
                    location: { lat: 27.5670, lng: 80.6840, area: 'Simulated Scan' },
                    wasteTypes: ['Plastic', 'Mixed Waste'],
                    severity: 'high',
                    imageUrl: null,
                    area: 'Test Area',
                  });
                  toast.success('New detection created!');
                  fetchDetections();
                } catch (error) {
                  console.error('Error creating detection:', error);
                  toast.error('Failed to create detection');
                }
              }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:shadow-xl transition-all duration-200"
            >
              <Plane className="w-12 h-12" />
              <span className="font-medium">Trigger New Scan</span>
            </motion.button>
          </div>
        )}

        {view === 'heatmap' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Waste Hotspot Heatmap</h2>
            
            {/* Simulated Map with Heatmap */}
            <div className="relative aspect-video bg-gradient-to-br from-green-100 via-yellow-100 to-red-100 rounded-xl overflow-hidden mb-4">
              {/* Hotspot markers */}
              {hotspots.map((spot, index) => {
                const positions = [
                  { top: '30%', left: '40%' },
                  { top: '60%', left: '70%' },
                  { top: '45%', left: '25%' },
                ];
                
                return (
                  <motion.div
                    key={spot.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.7 }}
                    transition={{ delay: index * 0.2 }}
                    className={`absolute rounded-full ${
                      spot.severity === 'high' ? 'bg-red-500 w-32 h-32' :
                      spot.severity === 'medium' ? 'bg-orange-500 w-24 h-24' :
                      'bg-yellow-500 w-16 h-16'
                    } blur-2xl`}
                    style={positions[index]}
                  />
                );
              })}

              {/* Legend */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
                <div className="text-xs font-medium text-gray-700 mb-2">Severity</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full" />
                    <span className="text-xs text-gray-600">High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full" />
                    <span className="text-xs text-gray-600">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                    <span className="text-xs text-gray-600">Low</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hotspot List */}
            <div className="space-y-3">
              {hotspots.map((spot, index) => (
                <motion.div
                  key={spot.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    spot.severity === 'high' ? 'bg-red-100' :
                    spot.severity === 'medium' ? 'bg-orange-100' :
                    'bg-yellow-100'
                  }`}>
                    <AlertTriangle className={`w-6 h-6 ${
                      spot.severity === 'high' ? 'text-red-600' :
                      spot.severity === 'medium' ? 'text-orange-600' :
                      'text-yellow-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{spot.area}</div>
                    <div className="text-sm text-gray-500">
                      {spot.types.join(', ')} • {spot.size} area
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    spot.severity === 'high' ? 'bg-red-100 text-red-700' :
                    spot.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {spot.severity.charAt(0).toUpperCase() + spot.severity.slice(1)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'insights' && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Insights</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                  <div className="text-3xl font-bold text-red-600 mb-1">3</div>
                  <div className="text-sm text-red-700">Active Hotspots</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="text-3xl font-bold text-blue-600 mb-1">156</div>
                  <div className="text-sm text-blue-700">Total Detections</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                  <div className="text-3xl font-bold text-green-600 mb-1">94%</div>
                  <div className="text-sm text-green-700">Detection Accuracy</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-orange-500 pl-4 py-2">
                  <div className="font-medium text-gray-900 mb-1">🔥 Most Affected Area This Week</div>
                  <p className="text-sm text-gray-600">Near Pond - 45% increase in plastic waste detected</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="font-medium text-gray-900 mb-1">📊 Waste Type Distribution</div>
                  <p className="text-sm text-gray-600">Plastic (52%) • Organic (28%) • Mixed (20%)</p>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="font-medium text-gray-900 mb-1">🔄 Repeat Dumping Zones</div>
                  <p className="text-sm text-gray-600">Main Road sector requires increased monitoring</p>
                </div>

                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="font-medium text-gray-900 mb-1">✅ Improvement Detected</div>
                  <p className="text-sm text-gray-600">North sector shows 30% reduction in waste</p>
                </div>
              </div>
            </motion.div>
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
                  src={selectedDetection.imageUrl || 'https://images.unsplash.com/photo-1572949645841-094325c0e556?w=800&h=400&fit=crop'}
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
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${\n                    selectedDetection.severity === 'high' ? 'bg-red-100 text-red-700' :\n                    selectedDetection.severity === 'medium' ? 'bg-orange-100 text-orange-700' :\n                    'bg-yellow-100 text-yellow-700'\n                  }`}>
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
                    🚨 GaonSweep Alert: Waste detected at {selectedDetection.location.address}. \n
                    Type: {selectedDetection.wasteTypes.join(', ')}. Amount: {selectedDetection.amount}. \n
                    Priority: {selectedDetection.severity.toUpperCase()}. Press 1 to accept job, 0 to decline.\n
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