import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTranslation } from './translations';

interface AIRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  portal: 'villager' | 'drone' | 'worker' | 'admin';
  language: string;
}

export function AIRoleModal({ isOpen, onClose, portal, language }: AIRoleModalProps) {
  const t = (key: string) => getTranslation(language, key);

  const getAIFeatures = () => {
    switch (portal) {
      case 'villager':
        return {
          title: t('villagerAITitle'),
          features: [
            t('villagerAI1'),
            t('villagerAI2'),
            t('villagerAI3'),
            t('villagerAI4'),
            t('villagerAI5'),
            t('villagerAI6'),
          ],
        };
      case 'drone':
        return {
          title: t('droneAITitle'),
          features: [
            t('droneAI1'),
            t('droneAI2'),
            t('droneAI3'),
            t('droneAI4'),
            t('droneAI5'),
            t('droneAI6'),
            t('droneAI7'),
          ],
        };
      case 'worker':
        return {
          title: t('workerAITitle'),
          features: [
            t('workerAI1'),
            t('workerAI2'),
            t('workerAI3'),
            t('workerAI4'),
            t('workerAI5'),
            t('workerAI6'),
          ],
        };
      case 'admin':
        return {
          title: t('adminAITitle'),
          features: [
            t('adminAI1'),
            t('adminAI2'),
            t('adminAI3'),
            t('adminAI4'),
            t('adminAI5'),
            t('adminAI6'),
            t('adminAI7'),
          ],
        };
    }
  };

  const aiData = getAIFeatures();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl bg-white rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-bold">{t('aiPoweredFeatures')}</h2>
                    <p className="text-white/80 text-sm">{aiData.title}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {aiData.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100"
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 leading-relaxed">{feature}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer Info */}
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-yellow-900 font-medium mb-1">
                      {language === 'hi' ? 'एआई का व्यापक उपयोग' : 'Extensive AI Integration'}
                    </p>
                    <p className="text-yellow-800 text-sm">
                      {language === 'hi' 
                        ? 'SevaSetu ग्रामीण कचरा प्रबंधन में एआई की सबसे उन्नत और व्यापक एकीकरण प्रदर्शित करता है। प्रत्येक पोर्टल में अत्याधुनिक एमएल मॉडल, कंप्यूटर विज़न, और एनएलपी तकनीकों का उपयोग किया गया है।'
                        : 'SevaSetu demonstrates the most advanced and extensive AI integration in rural waste management. Each portal leverages cutting-edge ML models, computer vision, and NLP technologies.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Button */}
            <div className="p-6 border-t flex-shrink-0">
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-shadow"
              >
                {t('closeModal')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}