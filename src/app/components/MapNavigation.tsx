import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Navigation, MapPin, Phone, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MapNavigationProps {
  destination: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    type?: 'bin' | 'job';
  };
  onClose: () => void;
  onArrived?: () => void;
}

export function MapNavigation({ destination, onClose, onArrived }: MapNavigationProps) {
  const [userLocation, setUserLocation] = useState({ lat: 27.5664, lng: 80.6825 });
  const [distance, setDistance] = useState(0);
  const [eta, setEta] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [routeProgress, setRouteProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Route steps - realistic for Indian village (85-220m total)
  const routeSteps = [
    { instruction: 'पूर्व में मुख्य मार्ग पर चलें (Head east on Main Road)', distance: '45 m', icon: '⬆️' },
    { instruction: 'गाँव केंद्र पर दाएं मुड़ें (Turn right at Village Center)', distance: '55 m', icon: '➡️' },
    { instruction: 'मंदिर से सीधे जाएं (Continue straight past Temple)', distance: '65 m', icon: '⬆️' },
    { instruction: `${destination.name} पर पहुंचें (Arrive)`, distance: '0 m', icon: '🎯' },
  ];

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // Convert to meters
    return distance;
  };

  useEffect(() => {
    const dist = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      destination.lat,
      destination.lng
    );
    
    // Cap distance at realistic Indian village scale (85-220m)
    const cappedDistance = Math.min(Math.round(dist), 220);
    const realisticDistance = cappedDistance < 50 ? Math.max(85, cappedDistance) : cappedDistance;
    
    setDistance(realisticDistance);
    
    // Calculate ETA: Assume worker walks at 60m/min (3.6 km/h - slow walking with equipment)
    // For village scale: 85m = 1-2 min, 150m = 2-3 min, 220m = 3-4 min
    const calculatedEta = Math.max(1, Math.round(realisticDistance / 60));
    setEta(calculatedEta);
  }, [userLocation, destination]);

  const startNavigation = () => {
    setIsNavigating(true);
    toast.success('Navigation started!', {
      description: 'Follow the directions on screen',
    });

    // Simulate navigation progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      setRouteProgress(progress);

      // Update current step based on progress
      const stepIndex = Math.floor((progress / 100) * routeSteps.length);
      setCurrentStep(Math.min(stepIndex, routeSteps.length - 1));

      // Simulate location updates
      const progressRatio = progress / 100;
      const newLat = userLocation.lat + (destination.lat - userLocation.lat) * progressRatio;
      const newLng = userLocation.lng + (destination.lng - userLocation.lng) * progressRatio;
      setUserLocation({ lat: newLat, lng: newLng });

      if (progress >= 100) {
        clearInterval(interval);
        setIsNavigating(false);
        toast.success('🎉 You have arrived!', {
          description: destination.name,
        });
        if (onArrived) {
          onArrived();
        }
      }
    }, 300); // Update every 300ms for smooth animation

    return () => clearInterval(interval);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Navigation className="w-6 h-6" />
          <div>
            <h2 className="font-bold">{destination.name}</h2>
            <p className="text-xs opacity-90">{destination.address}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Map View */}
      <div className="flex-1 relative bg-gradient-to-br from-green-100 to-blue-100">
        {/* Simulated Map */}
        <div className="absolute inset-0">
          {/* Route Line */}
          <svg className="absolute inset-0 w-full h-full">
            <motion.line
              x1="20%"
              y1="80%"
              x2="80%"
              y2="20%"
              stroke="#3B82F6"
              strokeWidth="6"
              strokeDasharray="10,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5 }}
            />
          </svg>

          {/* User Location Marker */}
          <motion.div
            className="absolute w-16 h-16 bg-blue-500 rounded-full border-4 border-white shadow-2xl flex items-center justify-center"
            style={{
              left: `${20 + routeProgress * 0.6}%`,
              top: `${80 - routeProgress * 0.6}%`,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Navigation className="w-8 h-8 text-white" style={{ transform: 'rotate(45deg)' }} />
          </motion.div>

          {/* Destination Marker */}
          <motion.div
            className="absolute w-20 h-20 bg-red-500 rounded-full border-4 border-white shadow-2xl flex items-center justify-center"
            style={{
              left: '80%',
              top: '20%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MapPin className="w-10 h-10 text-white" />
          </motion.div>

          {/* Route Progress Overlay */}
          {isNavigating && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-2 bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${routeProgress}%` }}
            />
          )}
        </div>

        {/* Distance & ETA Card */}
        <motion.div
          className="absolute top-4 left-4 right-4 bg-white rounded-2xl shadow-2xl p-4"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{Math.max(0, Math.round(distance * (1 - routeProgress / 100)))} m</div>
              <div className="text-xs text-gray-600">Distance</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{Math.max(0, Math.round(eta * (1 - routeProgress / 100)))} min</div>
              <div className="text-xs text-gray-600">ETA</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{routeProgress}%</div>
              <div className="text-xs text-gray-600">Progress</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Instructions */}
      <div className="bg-white p-6 rounded-t-3xl shadow-2xl">
        {isNavigating ? (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">{routeSteps[currentStep].icon}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {routeSteps[currentStep].instruction}
                </h3>
                <p className="text-gray-600">{routeSteps[currentStep].distance}</p>
              </div>
            </div>

            {/* All Steps */}
            <div className="space-y-2">
              {routeSteps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    index === currentStep
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : index < currentStep
                      ? 'bg-green-50 opacity-50'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="text-2xl">{step.icon}</div>
                  <div className="flex-1 text-sm">
                    <div className={`font-medium ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.instruction}
                    </div>
                    <div className="text-xs text-gray-500">{step.distance}</div>
                  </div>
                  {index < currentStep && <CheckCircle className="w-5 h-5 text-green-600" />}
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Navigate</h3>
            <p className="text-gray-600 mb-4">
              Distance: {distance}m • Estimated time: {eta} minutes
            </p>
            <button
              onClick={startNavigation}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Navigation className="w-6 h-6" />
              Start Navigation
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}