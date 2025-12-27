import React from 'react';
import { User, Globe, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { UserSettings } from '../VillagerApp';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
];

interface ProfileScreenProps {
  userSettings: UserSettings;
  setUserSettings: (settings: UserSettings) => void;
}

export function ProfileScreen({ userSettings, setUserSettings }: ProfileScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-20">
      <div className="p-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{userSettings.name}</h2>
          <p className="text-gray-600 mb-4">{userSettings.village}</p>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <div className="text-2xl font-bold text-gray-900">75</div>
              <div className="text-xs text-gray-500">Points</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-xs text-gray-500">Scans</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-xs text-gray-500">Reports</div>
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-5 mb-6"
        >
          <h3 className="font-bold text-gray-900 mb-4">Achievements</h3>
          <div className="grid grid-cols-4 gap-3">
            {['🌟', '♻️', '🌱', '🏆', '⚡', '💧', '🎯', '🔥'].map((emoji, i) => (
              <div
                key={i}
                className={`aspect-square rounded-xl flex items-center justify-center text-3xl ${
                  i < 3 ? 'bg-yellow-100' : 'bg-gray-100'
                }`}
              >
                {emoji}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Settings */}
        <h3 className="font-bold text-gray-900 mb-4">Settings</h3>
        
        <div className="space-y-3 mb-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full bg-white rounded-xl shadow-md p-4 flex items-center gap-3 hover:shadow-lg transition-all duration-200"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">Language</div>
              <div className="text-sm text-gray-500">
                {languages.find(l => l.code === userSettings.language)?.name || 'English'}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full bg-white rounded-xl shadow-md p-4 flex items-center gap-3 hover:shadow-lg transition-all duration-200"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">Notifications</div>
              <div className="text-sm text-gray-500">Manage alerts</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full bg-white rounded-xl shadow-md p-4 flex items-center gap-3 hover:shadow-lg transition-all duration-200"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">Privacy</div>
              <div className="text-sm text-gray-500">Data & permissions</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-5 mb-6"
        >
          <h3 className="font-bold text-gray-900 mb-3">About SevaSetu</h3>
          <p className="text-sm text-gray-600 mb-2">
            Version 1.0.0
          </p>
          <p className="text-sm text-gray-600">
            AI-powered waste management for rural India. Making villages cleaner, one scan at a time.
          </p>
        </motion.div>

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full bg-red-50 text-red-600 rounded-xl py-4 font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </motion.button>
      </div>
    </div>
  );
}