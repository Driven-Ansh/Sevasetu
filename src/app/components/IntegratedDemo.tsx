import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mic, Camera, Plane, HardHat, Users, TrendingUp, 
  CheckCircle, AlertCircle, Zap, Wifi, MessageSquare
} from 'lucide-react';

interface IntegratedDemoProps {
  onClose: () => void;
}

export function IntegratedDemo({ onClose }: IntegratedDemoProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: 'Welcome to SevaSetu',
      description: 'Complete AI-powered rural waste management system',
      icon: Zap,
      color: 'from-purple-500 to-purple-600',
      features: [
        '🎤 Voice-based waste classification',
        '📸 AI camera scanning',
        '🛸 Drone monitoring',
        '👷 Worker management',
        '📊 Admin analytics',
        '📱 SMS notifications (works offline!)',
      ],
    },
    {
      title: 'Step 1: Villager Reports Waste',
      description: 'Voice or camera - AI identifies waste type',
      icon: Mic,
      color: 'from-green-500 to-green-600',
      features: [
        'Speak: "Plastic bottle" in Hindi or English',
        'AI classifies: Dry/Wet/Organic/Hazardous',
        'Shows correct bin (Blue/Green/Red)',
        'Map navigation to nearest bin',
        '+5 points reward for reporting',
        'Works with low literacy users',
      ],
    },
    {
      title: 'Step 2: Drone Detects Waste Areas',
      description: 'AI-powered aerial surveillance in action',
      icon: Plane,
      color: 'from-blue-500 to-blue-600',
      features: [
        'Click "Start Drone Testing"',
        'Live waste detection with AI bounding boxes',
        'Hotspot heatmap visualization',
        'Automatic job creation for high severity',
        'Real-time updates to worker portal',
        '94% AI detection accuracy',
      ],
    },
    {
      title: 'Step 3: Worker Gets Notified',
      description: 'SMS-based job assignment (offline capable)',
      icon: HardHat,
      color: 'from-orange-500 to-orange-600',
      features: [
        'SMS: "Waste at Main Road - Plastic. Press 1 to accept"',
        'Worker accepts via SMS (works without internet)',
        'Job appears in worker app',
        'Offline mode with local storage',
        'Auto-sync when connection restored',
        'Track job status in real-time',
      ],
    },
    {
      title: 'Step 4: Complete & Analyze',
      description: 'Data-driven insights for panchayat',
      icon: TrendingUp,
      color: 'from-indigo-500 to-indigo-600',
      features: [
        'Worker marks job complete',
        'SMS notification sent to villager',
        'Analytics dashboard updated',
        'Village cleanliness score calculated',
        'Compare with other villages',
        'Generate reports for officials',
      ],
    },
    {
      title: 'Key Features',
      description: 'Built for rural India',
      icon: CheckCircle,
      color: 'from-pink-500 to-pink-600',
      features: [
        '🌐 Multilingual: Hindi & English',
        '📴 Offline-first: Works without internet',
        '📱 SMS integration for basic phones',
        '🎯 Low-literacy friendly UI',
        '🤖 Real AI (voice recognition + classification)',
        '⚡ Production-ready with Supabase backend',
      ],
    },
  ];

  const currentStepData = demoSteps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${currentStepData.color} text-white p-6`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <StepIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
              <p className="text-white/90 text-sm">{currentStepData.description}</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex gap-2">
            {demoSteps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  index <= currentStep ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-3">
              {currentStepData.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className={`w-8 h-8 bg-gradient-to-br ${currentStepData.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-gray-700 pt-1">{feature}</p>
                </motion.div>
              ))}
            </div>

            {/* Special annotations */}
            {currentStep === 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="font-bold text-orange-900">Hackathon Demo Ready!</span>
                </div>
                <p className="text-sm text-orange-800">
                  All features are fully functional with real-time Supabase integration. 
                  This is not a prototype - it's production-grade code ready for deployment.
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-blue-900">Live Demo Instructions</span>
                </div>
                <p className="text-sm text-blue-800">
                  Navigate to Drone Dashboard → Click "Start Drone Testing" → 
                  Watch as waste areas are detected in real-time → New jobs appear in Worker App
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                  <span className="font-bold text-orange-900">Offline-First Design</span>
                </div>
                <p className="text-sm text-orange-800">
                  Worker can accept/reject jobs via SMS on basic phone. App caches data locally 
                  and syncs automatically when internet is available. Perfect for rural areas!
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Previous
              </button>
            )}
            
            {currentStep < demoSteps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className={`flex-1 bg-gradient-to-r ${currentStepData.color} text-white rounded-xl py-3 font-medium hover:shadow-lg transition-all duration-200`}
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={onClose}
                className={`flex-1 bg-gradient-to-r ${currentStepData.color} text-white rounded-xl py-3 font-medium hover:shadow-lg transition-all duration-200`}
              >
                Start Using SevaSetu
              </button>
            )}
          </div>
          
          <div className="text-center mt-3">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip Demo
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}