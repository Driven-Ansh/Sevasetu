import React from 'react';
import { BookOpen, Recycle, Leaf, Droplet, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import type { UserSettings } from '../VillagerApp';

interface LearnScreenProps {
  userSettings: UserSettings;
}

const lessons = [
  {
    id: 1,
    title: 'Plastic Recycling',
    icon: Recycle,
    color: 'from-blue-500 to-blue-600',
    duration: '3 min',
    points: 10,
    description: 'Learn how to properly sort and recycle plastic waste',
  },
  {
    id: 2,
    title: 'Composting Basics',
    icon: Leaf,
    color: 'from-green-500 to-green-600',
    duration: '5 min',
    points: 15,
    description: 'Turn organic waste into valuable fertilizer',
  },
  {
    id: 3,
    title: 'Water Conservation',
    icon: Droplet,
    color: 'from-cyan-500 to-cyan-600',
    duration: '4 min',
    points: 10,
    description: 'Save water while managing waste',
  },
  {
    id: 4,
    title: 'E-Waste Safety',
    icon: Zap,
    color: 'from-red-500 to-red-600',
    duration: '6 min',
    points: 20,
    description: 'Safely dispose of electronics and batteries',
  },
];

const tips = [
  { emoji: '♻️', tip: 'Rinse plastic containers before recycling' },
  { emoji: '🌱', tip: 'Compost kitchen waste to reduce landfill' },
  { emoji: '🛍️', tip: 'Use cloth bags instead of plastic' },
  { emoji: '💧', tip: 'Reuse water bottles multiple times' },
];

export function LearnScreen({ userSettings }: LearnScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Learn & Earn</h1>
          <p className="text-gray-600">Gain knowledge, earn points</p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-500">Learning Progress</div>
              <div className="text-2xl font-bold text-gray-900">2 of 4</div>
            </div>
            <div className="text-4xl">📚</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '50%' }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Complete all lessons to become a Waste Master!
          </div>
        </motion.div>

        {/* Lessons */}
        <h2 className="font-bold text-gray-900 mb-4">Available Lessons</h2>
        <div className="space-y-3 mb-6">
          {lessons.map((lesson, index) => {
            const Icon = lesson.icon;
            const completed = index < 2; // First 2 are completed for demo
            
            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden ${
                  completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-center gap-4 p-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${lesson.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{lesson.title}</h3>
                      {completed && (
                        <span className="text-green-500 text-sm">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>⏱️ {lesson.duration}</span>
                      <span>•</span>
                      <span>🌟 {lesson.points} points</span>
                    </div>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      completed
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    } transition-colors duration-200`}
                  >
                    {completed ? 'Done' : 'Start'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Tips */}
        <h2 className="font-bold text-gray-900 mb-4">Quick Tips</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-white rounded-xl shadow-md p-4"
            >
              <div className="text-3xl mb-2">{tip.emoji}</div>
              <p className="text-sm text-gray-700">{tip.tip}</p>
            </motion.div>
          ))}
        </div>

        {/* Achievement Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 text-center"
        >
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="font-bold text-gray-900 mb-2">Next Achievement</h3>
          <p className="text-sm text-gray-600 mb-3">
            Complete 2 more lessons to unlock "Eco Warrior" badge
          </p>
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '50%' }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
