import React, { useState, useEffect } from 'react';
import '../styles/index.css';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Card } from './components/ui/card';
import { VillagerApp } from './components/VillagerApp';
import { AIInferenceEngine } from './components/AIInferenceEngine';
import { WorkerApp } from './components/WorkerApp';
import { AdminDashboard } from './components/AdminDashboard';
import { DemoMode } from './components/DemoMode';
import { AIRoleModal } from './components/AIRoleModal';
import { SevaSetuLogo } from './components/SevasetuLogo';
import { Smartphone, Brain, HardHat, BarChart3, Globe, Play, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Toaster } from 'sonner';
import { getTranslation } from './components/translations';

type Portal = 'home' | 'villager' | 'drone' | 'worker' | 'admin' | 'demo';

export default function App() {
  const [currentPortal, setCurrentPortal] = useState<Portal>('home');
  const [language, setLanguage] = useState('en');
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedAIPortal, setSelectedAIPortal] = useState<'villager' | 'drone' | 'worker' | 'admin'>('villager');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const t = (key: string) => getTranslation(language, key);
  
  // Clear old data and start fresh with new AI features
  useEffect(() => {
    // Check if this is first load with new AI features
    const hasNewFeatures = localStorage.getItem('aiFeatures_v2');
    if (!hasNewFeatures) {
      // Clear old job data
      localStorage.removeItem('workerJobs');
      localStorage.removeItem('workerSMS');
      localStorage.removeItem('aiInferences');
      localStorage.removeItem('pendingUpdates');
      
      // Mark new features as loaded
      localStorage.setItem('aiFeatures_v2', 'true');
      console.log('🧹 Cleared old data - Starting fresh with AI Inference Engine features');
    }
  }, []);
  
  // Set document title
  useEffect(() => {
    document.title = 'SevaSetu - AI-Powered Rural Waste Management';
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  ];

  const portals = [
    {
      id: 'villager' as Portal,
      title: t('villagerAppTitle'),
      description: t('villagerAppDesc'),
      icon: Smartphone,
      color: 'from-green-500 to-green-600',
      features: [t('aiScanning'), t('voiceRecognition'), t('mapNavigation'), t('reportLitterFeature')],
    },
    {
      id: 'drone' as Portal,
      title: t('droneMonitoringTitle'),
      description: t('droneMonitoringDesc'),
      icon: Brain,
      color: 'from-blue-500 to-blue-600',
      features: [t('liveDetectionFeature'), t('hotspotHeatmapFeature'), t('aiInsights'), t('timelineView')],
    },
    {
      id: 'worker' as Portal,
      title: t('workerAppTitle'),
      description: t('workerAppDesc'),
      icon: HardHat,
      color: 'from-orange-500 to-orange-600',
      features: [t('jobList'), t('smsAlerts'), t('routeOptimization'), t('photoUpload')],
    },
    {
      id: 'admin' as Portal,
      title: t('adminDashboardTitle'),
      description: t('adminDashboardDesc'),
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      features: [t('analytics'), t('villageComparison'), t('reports'), t('scalability')],
    },
  ];

  const handleViewAIRole = (portalId: 'villager' | 'drone' | 'worker' | 'admin', e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAIPortal(portalId);
    setShowAIModal(true);
  };

  if (currentPortal === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <Toaster />
        
        {/* AI Role Modal */}
        <AIRoleModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          portal={selectedAIPortal}
          language={language}
        />

        {/* Language Selector */}
        {showLanguageSelector && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowLanguageSelector(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4">{t('selectLanguage')}</h3>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={language === lang.code ? 'default' : 'outline'}
                    className="w-full justify-start text-lg"
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLanguageSelector(false);
                    }}
                  >
                    <span className="text-2xl mr-3">{lang.flag}</span>
                    {lang.name}
                  </Button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-6">
                {/* Logo */}
                <SevaSetuLogo size="xl" />
                
                {/* Brand Text */}
                <div>
                  <h1 className="text-5xl mb-2 font-bold">{t('appName')}</h1>
                  <p className="text-xl opacity-90">{t('tagline')}</p>
                </div>
              </div>
              
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setShowLanguageSelector(true)}
              >
                <Globe className="w-5 h-5 mr-2" />
                {languages.find(l => l.code === language)?.name}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: t('aiPowered'), value: '92%', icon: '🤖' },
                { label: t('ruralFriendly'), value: '100%', icon: '🏡' },
                { label: t('multilingual'), value: '2+', icon: '🌐' },
                { label: t('realtime'), value: 'Live', icon: '⚡' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <p className="text-3xl mb-1">{stat.icon}</p>
                  <p className="text-2xl mb-1">{stat.value}</p>
                  <p className="text-sm opacity-80">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Demo Mode CTA */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white cursor-pointer hover:shadow-2xl transition-shadow" onClick={() => setCurrentPortal('demo')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-10 h-10" />
                  </div>
                  <div>
                    <Badge className="mb-2 bg-white/20">{t('recommendedForJudges')}</Badge>
                    <h2 className="text-3xl mb-2">{t('interactiveDemoMode')}</h2>
                    <p className="text-xl opacity-90">{t('watchCompleteWorkflow')}</p>
                  </div>
                </div>
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Button size="lg" variant="secondary">
                    {t('startDemo')} →
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Portal Selection */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="mb-8">
            <h2 className="text-center mb-2">{t('selectPortal')}</h2>
            <p className="text-center text-gray-600">{t('interconnectedSystems')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portals.map((portal, index) => {
              const Icon = portal.icon;
              return (
                <motion.div
                  key={portal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <Card
                    className="p-6 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105"
                    onClick={() => setCurrentPortal(portal.id)}
                  >
                    <div className="flex items-start space-x-4 mb-4">
                      <motion.div
                        className={`w-16 h-16 bg-gradient-to-br ${portal.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="w-8 h-8" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="mb-1">{portal.title}</h3>
                        <p className="text-gray-600">{portal.description}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {portal.features.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button className="flex-1" variant="outline" onClick={() => setCurrentPortal(portal.id)}>
                        {t('openPortal')} →
                      </Button>
                      <Button 
                        variant="secondary"
                        className="px-3"
                        onClick={(e) => handleViewAIRole(portal.id as 'villager' | 'drone' | 'worker' | 'admin', e)}
                      >
                        <Sparkles className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-center mb-2">{t('systemOverview')}</h2>
            <p className="text-center text-gray-600 mb-8">{t('comprehensiveEcosystem')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🤖',
                  title: t('aiPoweredIntelligence'),
                  description: t('aiPoweredDesc'),
                },
                {
                  icon: '📱',
                  title: t('ruralFirstDesign'),
                  description: t('ruralFirstDesc'),
                },
                {
                  icon: '🌐',
                  title: t('completeEcosystem'),
                  description: t('completeEcosystemDesc'),
                },
                {
                  icon: '📊',
                  title: t('dataDrivenInsights'),
                  description: t('dataDrivenDesc'),
                },
                {
                  icon: '🗺️',
                  title: t('smartNavigation'),
                  description: t('smartNavigationDesc'),
                },
                {
                  icon: '⚡',
                  title: t('scalableArchitecture'),
                  description: t('scalableArchitectureDesc'),
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="text-center p-6 rounded-xl hover:shadow-lg transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <div className="text-6xl mb-4">{feature.icon}</div>
                  <h3 className="mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* USPs */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-center mb-2">{t('uniqueSellingPoints')}</h2>
            <p className="text-center text-gray-600 mb-8">{t('whatMakesDifferent')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: '🎯',
                  title: t('firstAIDrone'),
                  points: [t('aerialDetection'), t('automatedDispatch'), t('realTimeHeatmaps')],
                },
                {
                  icon: '🗣️',
                  title: t('voiceFirstInterface'),
                  points: [t('hindiEnglishVoice'), t('lowLiteracyFriendly'), t('handsFreeOperation')],
                },
                {
                  icon: '📴',
                  title: t('offlineCapable'),
                  points: [t('smsNotifications'), t('localDataCaching'), t('autoSyncOnline')],
                },
                {
                  icon: '🏆',
                  title: t('endToEndSolution'),
                  points: [t('notJustTracking'), t('integratedPanchayat'), t('measurableImpact')],
                },
              ].map((usp, index) => (
                <motion.div
                  key={usp.title}
                  className="bg-white rounded-xl p-6 shadow-md"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{usp.icon}</div>
                    <div className="flex-1">
                      <h3 className="mb-3 text-lg">{usp.title}</h3>
                      <ul className="space-y-2">
                        {usp.points.map((point) => (
                          <li key={point} className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-6">
              <SevaSetuLogo size="lg" className="mb-4" />
              <h3 className="text-2xl font-bold mb-2">{t('appName')}</h3>
              <p className="text-gray-400 mb-4">{t('tagline')}</p>
            </div>
            <p className="mb-2 text-lg text-center">{t('madeBy')} <span className="font-bold text-blue-400">The Vision</span> {t('forEvent')} <span className="font-bold text-purple-400">Square Hacks</span></p>
            <p className="text-xs text-gray-500 text-center">{t('builtWith')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentPortal === 'demo') {
    return (
      <div>
        <Toaster />
        <div className="fixed top-4 left-4 z-50">
          <Button variant="outline" onClick={() => setCurrentPortal('home')}>
            ← {t('backToHome')}
          </Button>
        </div>
        <DemoMode language={language} />
      </div>
    );
  }

  if (currentPortal === 'villager') {
    return (
      <div>
        <Toaster />
        <div className="fixed top-4 right-4 z-50">
          <Button variant="outline" onClick={() => setCurrentPortal('home')}>
            ← {t('home')}
          </Button>
        </div>
        <VillagerApp language={language} />
      </div>
    );
  }

  if (currentPortal === 'drone') {
    return (
      <div>
        <Toaster />
        <div className="fixed top-4 right-4 z-50">
          <Button variant="outline" onClick={() => setCurrentPortal('home')}>
            ← {t('backToHome')}
          </Button>
        </div>
        <AIInferenceEngine language={language} />
      </div>
    );
  }

  if (currentPortal === 'worker') {
    return (
      <div>
        <Toaster />
        <div className="fixed top-4 right-4 z-50">
          <Button variant="outline" onClick={() => setCurrentPortal('home')}>
            ← {t('backToHome')}
          </Button>
        </div>
        <WorkerApp language={language} />
      </div>
    );
  }

  if (currentPortal === 'admin') {
    return (
      <div>
        <Toaster />
        <div className="fixed top-4 right-4 z-50">
          <Button variant="outline" onClick={() => setCurrentPortal('home')}>
            ← {t('backToHome')}
          </Button>
        </div>
        <AdminDashboard language={language} />
      </div>
    );
  }

  return null;
}