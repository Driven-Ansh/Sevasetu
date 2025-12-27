import React, { useState } from 'react';
import { MapPin, Navigation, Trash2, Recycle, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { UserSettings } from '../VillagerApp';
import { MapNavigation } from '../MapNavigation';

interface MapScreenProps {
  userSettings: UserSettings;
}

const bins = [
  { id: 1, type: 'Plastic', icon: '♻️', color: 'bg-blue-500', lat: 27.5670, lng: 80.6835, distance: '85m', address: 'पास मंदिर, मुख्य मार्ग (Near Temple, Main Road)' },
  { id: 2, type: 'Organic', icon: '🌱', color: 'bg-green-500', lat: 27.5665, lng: 80.6840, distance: '150m', address: 'समुदाय भवन, पश्चिम (Community Center, West)' },
  { id: 3, type: 'Glass', icon: '🫙', color: 'bg-cyan-500', lat: 27.5672, lng: 80.6828, distance: '120m', address: 'पंचायत कार्यालय (Panchayat Office)' },
  { id: 4, type: 'Metal', icon: '🔩', color: 'bg-gray-500', lat: 27.5668, lng: 80.6845, distance: '180m', address: 'बाज़ार चौक, पूर्व (Market Square, East)' },
  { id: 5, type: 'Hazardous', icon: '⚠️', color: 'bg-red-500', lat: 27.5660, lng: 80.6820, distance: '220m', address: 'स्वास्थ्य केंद्र (Health Center)' },
];

export function MapScreen({ userSettings }: MapScreenProps) {
  const [selectedBin, setSelectedBin] = useState<typeof bins[0] | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [showNavigation, setShowNavigation] = useState(false);

  const filteredBins = filterType === 'all' ? bins : bins.filter(b => b.type === filterType);

  const handleNavigate = () => {
    if (selectedBin) {
      setShowNavigation(true);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Map View */}
      <div className="flex-1 relative bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
        {/* Simplified map illustration */}
        <div className="absolute inset-0 p-8">
          {/* Village center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-green-500">
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-center mt-2 bg-white px-3 py-1 rounded-full shadow-md text-sm font-medium">
              You are here
            </div>
          </div>

          {/* Bins */}
          {filteredBins.map((bin, index) => {
            const positions = [
              { top: '20%', left: '30%' },
              { top: '60%', left: '70%' },
              { top: '30%', left: '65%' },
              { top: '70%', left: '35%' },
              { top: '25%', left: '80%' },
            ];

            return (
              <motion.button
                key={bin.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedBin(bin)}
                className="absolute"
                style={positions[index]}
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                  className={`w-12 h-12 ${bin.color} rounded-full shadow-lg flex items-center justify-center text-2xl border-4 border-white`}
                >
                  {bin.icon}
                </motion.div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full shadow-md text-xs font-medium whitespace-nowrap">
                  {bin.distance}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Filter Chips */}
        <div className="absolute top-4 left-4 right-4 flex gap-2 overflow-x-auto pb-2">
          {['all', 'Plastic', 'Organic', 'Glass', 'Metal', 'Hazardous'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                filterType === type
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
              }`}
            >
              {type === 'all' ? 'All Bins' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Bin Details Bottom Sheet */}
      {selectedBin && (
        <motion.div
          initial={{ y: 300 }}
          animate={{ y: 0 }}
          className="bg-white rounded-t-3xl shadow-2xl p-6"
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 ${selectedBin.color} rounded-2xl flex items-center justify-center text-3xl`}>
              {selectedBin.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{selectedBin.type} Waste Bin</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{selectedBin.distance} away • 2 min walk</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2"
              onClick={handleNavigate}
            >
              <Navigation className="w-5 h-5" />
              Navigate
            </motion.button>
            <button
              onClick={() => setSelectedBin(null)}
              className="bg-gray-100 text-gray-700 rounded-xl py-3 font-medium"
            >
              Close
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-2">What can go here:</div>
            <p className="text-sm text-gray-900">
              {selectedBin.type === 'Plastic' && 'Bottles, containers, plastic bags, packaging'}
              {selectedBin.type === 'Organic' && 'Food scraps, vegetable waste, leaves, agricultural waste'}
              {selectedBin.type === 'Glass' && 'Glass bottles, jars, broken glass'}
              {selectedBin.type === 'Metal' && 'Cans, metal containers, old utensils'}
              {selectedBin.type === 'Hazardous' && 'Batteries, electronics, chemicals, medical waste'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      {!selectedBin && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-around text-xs">
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-lg">♻️</div>
              <span className="text-gray-600">Plastic</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-lg">🌱</div>
              <span className="text-gray-600">Organic</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-lg">🫙</div>
              <span className="text-gray-600">Glass</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-lg">🔩</div>
              <span className="text-gray-600">Metal</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-lg">⚠️</div>
              <span className="text-gray-600">Hazard</span>
            </div>
          </div>
        </div>
      )}

      {/* Map Navigation */}
      <AnimatePresence>
        {showNavigation && selectedBin && (
          <MapNavigation
            destination={{
              name: `${selectedBin.type} Waste Bin`,
              address: selectedBin.address,
              lat: selectedBin.lat,
              lng: selectedBin.lng,
              type: 'bin',
            }}
            onClose={() => {
              setShowNavigation(false);
              setSelectedBin(null);
            }}
            onArrived={() => {
              setShowNavigation(false);
              setSelectedBin(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}