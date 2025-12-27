import React from 'react';
import { Camera, Mic, Map as MapIcon, Flag, Recycle, Leaf, TrendingUp, Award } from 'lucide-react';
import { motion } from 'motion/react';
import type { VillagerScreen } from '../VillagerApp';
import type { UserSettings } from '../VillagerApp';

interface HomeScreenProps {
  onNavigate: (screen: VillagerScreen) => void;
  userSettings: UserSettings;
}

export function HomeScreen({ onNavigate, userSettings }: HomeScreenProps) {
  const mainActions = [
    { id: 'scan' as VillagerScreen, icon: Camera, title: 'Scan Waste', description: 'AI identifies waste type', color: 'from-blue-500 to-blue-600', gradient: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { id: 'voice' as VillagerScreen, icon: Mic, title: 'Voice Input', description: 'Describe your waste', color: 'from-purple-500 to-purple-600', gradient: 'bg-gradient-to-br from-purple-500 to-purple-600' },
  ];

  const quickActions = [
    { id: 'map' as VillagerScreen, icon: MapIcon, title: 'Find Bin', color: 'bg-green-500' },
    { id: 'report' as VillagerScreen, icon: Flag, title: 'Report Litter', color: 'bg-orange-500' },
  ];

  const stats = [
    { icon: Recycle, label: 'Waste Scanned', value: '12', color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: Leaf, label: 'CO₂ Saved', value: '8kg', color: 'text-green-600', bg: 'bg-green-100' },
    { icon: TrendingUp, label: 'This Week', value: '+3', color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-b-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm opacity-90 mb-1">Welcome back,</div>
          <h1 className="text-2xl font-bold mb-4">{userSettings.name || 'User'} 👋</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/20 backdrop-blur-lg rounded-xl p-3 text-center"
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs opacity-90">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Main Actions */}
      <div className="p-6">
        <h2 className="font-bold text-gray-900 mb-4">What would you like to do?</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {mainActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(action.id)}
                className={`${action.gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-left aspect-square flex flex-col justify-between`}
              >
                <Icon className="w-10 h-10 mb-2" />
                <div>
                  <div className="font-bold text-lg mb-1">{action.title}</div>
                  <div className="text-sm opacity-90">{action.description}</div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(action.id)}
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-3"
              >
                <div className={`${action.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-gray-900 text-left">{action.title}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Impact Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900">Community Impact</div>
              <div className="text-sm text-gray-600">Your village progress</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Cleanliness Score</span>
              <span className="font-bold text-green-600">78%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '78%' }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              🎉 Great job! Your village is in the top 25% this month.
            </p>
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 bg-white rounded-2xl p-4 shadow-md"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <div className="font-medium text-gray-900 mb-1">Quick Tip</div>
              <p className="text-sm text-gray-600">
                Plastic bottles can be recycled! Look for blue bins near the village center.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
