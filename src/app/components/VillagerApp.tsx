import React, { useState, useEffect } from 'react';
import { OnboardingFlow } from './villager/OnboardingFlow';
import { HomeScreen } from './villager/HomeScreen';
import { WasteScanScreen } from './villager/WasteScanScreen';
import { VoiceInputScreen } from './villager/VoiceInputScreen';
import { MapScreen } from './villager/MapScreen';
import { ReportScreen } from './villager/ReportScreen';
import { LearnScreen } from './villager/LearnScreen';
import { ProfileScreen } from './villager/ProfileScreen';
import { SevaSetuLogo } from './SevasetuLogo';
import { Home, Map, Flag, BookOpen, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTranslation } from './translations';

export type VillagerScreen = 'onboarding' | 'home' | 'scan' | 'voice' | 'map' | 'report' | 'learn' | 'profile';

export interface UserSettings {
  language: string;
  hasCompletedOnboarding: boolean;
  name: string;
  village: string;
}

interface VillagerAppProps {
  language: string;
}

export function VillagerApp({ language }: VillagerAppProps) {
  const [currentScreen, setCurrentScreen] = useState<VillagerScreen>('onboarding');
  const [userSettings, setUserSettings] = useState<UserSettings>({
    language: language,
    hasCompletedOnboarding: false,
    name: '',
    village: 'Rampur',
  });

  const t = (key: string) => getTranslation(userSettings.language, key);

  // Update language when prop changes
  useEffect(() => {
    setUserSettings(prev => ({ ...prev, language }));
  }, [language]);

  const completeOnboarding = (settings: Partial<UserSettings>) => {
    setUserSettings({ ...userSettings, ...settings, hasCompletedOnboarding: true });
    setCurrentScreen('home');
  };

  const navItems = [
    { id: 'home' as VillagerScreen, icon: Home, label: t('home') },
    { id: 'map' as VillagerScreen, icon: Map, label: t('map') },
    { id: 'report' as VillagerScreen, icon: Flag, label: t('report') },
    { id: 'learn' as VillagerScreen, icon: BookOpen, label: t('learn') },
    { id: 'profile' as VillagerScreen, icon: User, label: t('profile') },
  ];

  const showBottomNav = userSettings.hasCompletedOnboarding && !['scan', 'voice'].includes(currentScreen);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      {userSettings.hasCompletedOnboarding && (
        <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SevaSetuLogo size="md" />
            <div>
              <div className="font-bold text-gray-900">{t('appName')}</div>
              <div className="text-xs text-gray-500">{userSettings.village}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              🌟 75 {t('myPoints').split(' ')[1] || 'Points'}
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {currentScreen === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <OnboardingFlow onComplete={completeOnboarding} />
            </motion.div>
          )}
          {currentScreen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <HomeScreen onNavigate={setCurrentScreen} userSettings={userSettings} />
            </motion.div>
          )}
          {currentScreen === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <WasteScanScreen onBack={() => setCurrentScreen('home')} userSettings={userSettings} />
            </motion.div>
          )}
          {currentScreen === 'voice' && (
            <motion.div
              key="voice"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <VoiceInputScreen onBack={() => setCurrentScreen('home')} userSettings={userSettings} />
            </motion.div>
          )}
          {currentScreen === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MapScreen userSettings={userSettings} />
            </motion.div>
          )}
          {currentScreen === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ReportScreen userSettings={userSettings} />
            </motion.div>
          )}
          {currentScreen === 'learn' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LearnScreen userSettings={userSettings} />
            </motion.div>
          )}
          {currentScreen === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProfileScreen userSettings={userSettings} setUserSettings={setUserSettings} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all duration-200 ${
                  isActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform duration-200`} />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 w-12 h-1 bg-green-500 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}