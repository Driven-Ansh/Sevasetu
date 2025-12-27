import React, { useState } from 'react';
import { Languages, Camera, Mic, MessageSquare, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { getTranslation } from '../translations';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
];

interface OnboardingFlowProps {
  onComplete: (settings: { language: string; name: string }) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<'language' | 'welcome' | 'mode' | 'permissions'>('language');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [name, setName] = useState('');

  const t = (key: string) => getTranslation(selectedLanguage, key);

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);
    setTimeout(() => setStep('welcome'), 300);
  };

  const handleStart = () => {
    if (name.trim()) {
      setStep('mode');
    }
  };

  const handleModeSelect = () => {
    setStep('permissions');
  };

  const handleComplete = () => {
    onComplete({ language: selectedLanguage, name });
  };

  if (step === 'language') {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6"
        >
          <Languages className="w-10 h-10 text-white" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          {t('welcomeMessage')}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 text-center mb-8"
        >
          {t('selectPreferredLanguage')}
        </motion.p>

        <div className="w-full max-w-sm space-y-3">
          {languages.map((lang, index) => (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleLanguageSelect(lang.code)}
              className="w-full bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                  <span className="text-xl">🌍</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{lang.name}</div>
                  <div className="text-sm text-gray-500">{lang.nativeName}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-200" />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'welcome') {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-6xl mb-6"
        >
          🌾
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 mb-4 text-center"
        >
          {t('keepVillageClean')}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 text-center mb-8 max-w-md"
        >
          {t('aiPoweredWasteManagement')}
        </motion.p>

        <div className="w-full max-w-sm space-y-4">
          <input
            type="text"
            placeholder={t('enterYourNamePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors duration-200"
          />
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl py-4 font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('getStarted')}
          </motion.button>
        </div>
      </div>
    );
  }

  if (step === 'mode') {
    const modes = [
      { id: 'camera', icon: Camera, title: t('scanWaste'), description: t('useCameraToIdentify'), color: 'from-blue-500 to-blue-600' },
      { id: 'voice', icon: Mic, title: t('describeWaste'), description: t('describeWasteVoice'), color: 'from-purple-500 to-purple-600' },
      { id: 'sms', icon: MessageSquare, title: t('smsMode'), description: t('forFeaturePhones'), color: 'from-orange-500 to-orange-600' },
    ];

    return (
      <div className="h-screen flex flex-col items-center justify-center p-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          {t('chooseYourMode')}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 text-center mb-8"
        >
          {t('howToInteract')}
        </motion.p>

        <div className="w-full max-w-sm space-y-4">
          {modes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={handleModeSelect}
                className="w-full bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-4 group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${mode.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{mode.title}</div>
                  <div className="text-sm text-gray-500">{mode.description}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-200" />
              </motion.button>
            );
          })}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleModeSelect}
          className="mt-8 text-green-600 font-medium"
        >
          {t('chooseLater')} →
        </motion.button>
      </div>
    );
  }

  if (step === 'permissions') {
    const permissions = [
      { id: 'camera', icon: Camera, title: t('cameraAccess'), description: t('toScanWaste'), granted: true },
      { id: 'location', icon: '📍', title: t('locationAccess'), description: t('toFindBins'), granted: true },
      { id: 'mic', icon: Mic, title: t('microphoneAccess'), description: t('forVoiceCommands'), granted: true },
    ];

    return (
      <div className="h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6"
        >
          <span className="text-3xl">✓</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          {t('allowPermissions')}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 text-center mb-8"
        >
          {t('needThesePermissions')}
        </motion.p>

        <div className="w-full max-w-sm space-y-3 mb-8">
          {permissions.map((perm, index) => (
            <motion.div
              key={perm.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-md flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                {typeof perm.icon === 'string' ? (
                  <span className="text-2xl">{perm.icon}</span>
                ) : (
                  <perm.icon className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{perm.title}</div>
                <div className="text-sm text-gray-500">{perm.description}</div>
              </div>
              {perm.granted && (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleComplete}
          className="w-full max-w-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl py-4 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {t('continueToApp')}
        </motion.button>
      </div>
    );
  }

  return null;
}