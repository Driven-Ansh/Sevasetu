import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Zap, TrendingUp, MapPin, Clock, AlertTriangle, ChevronRight, X, Info, Target, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { getTranslation } from './translations';
import { toast } from 'sonner';

interface WeakSignal {
  id: string;
  type: 'villager_report' | 'voice_only' | 'worker_movement' | 'historical_pattern';
  location: { lat: number; lng: number };
  confidence: number;
  timestamp: string;
  description: string;
}

interface InferredHotspot {
  id: string;
  location: { lat: number; lng: number; address: string };
  confidence: number;
  contributingSignals: number;
  predictedWasteTypes: string[];
  severity: 'low' | 'medium' | 'high';
  reasoning: string[];
}

interface PredictiveAlert {
  id: string;
  location: string;
  timeframe: string;
  confidence: number;
  recommendedAction: string;
}

interface AIInferenceEngineProps {
  language?: string;
}

export function AIInferenceEngine({ language = 'en' }: AIInferenceEngineProps) {
  const [weakSignals, setWeakSignals] = useState<WeakSignal[]>([]);
  const [inferredHotspots, setInferredHotspots] = useState<InferredHotspot[]>([]);
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<InferredHotspot | null>(null);
  const [showExplainability, setShowExplainability] = useState(false);
  const [timelineView, setTimelineView] = useState<'yesterday' | 'today' | 'tomorrow'>('today');
  const [isProcessing, setIsProcessing] = useState(false);

  const t = (key: string) => getTranslation(language, key);

  // Generate mock weak signals
  useEffect(() => {
    const mockSignals: WeakSignal[] = [
      { id: '1', type: 'villager_report', location: { lat: 28.6139, lng: 77.2090 }, confidence: 0.35, timestamp: new Date().toISOString(), description: 'Plastic waste near market' },
      { id: '2', type: 'voice_only', location: { lat: 28.6145, lng: 77.2085 }, confidence: 0.28, timestamp: new Date().toISOString(), description: 'Voice report: कूड़ा जमा है' },
      { id: '3', type: 'worker_movement', location: { lat: 28.6142, lng: 77.2088 }, confidence: 0.22, timestamp: new Date().toISOString(), description: 'Worker noted area' },
      { id: '4', type: 'historical_pattern', location: { lat: 28.6140, lng: 77.2092 }, confidence: 0.42, timestamp: new Date().toISOString(), description: 'Past dumping spot' },
      { id: '5', type: 'villager_report', location: { lat: 28.6200, lng: 77.2150 }, confidence: 0.38, timestamp: new Date().toISOString(), description: 'Organic waste pile' },
      { id: '6', type: 'voice_only', location: { lat: 28.6205, lng: 77.2148 }, confidence: 0.31, timestamp: new Date().toISOString(), description: 'Temple area dirty' },
      { id: '7', type: 'historical_pattern', location: { lat: 28.6202, lng: 77.2152 }, confidence: 0.45, timestamp: new Date().toISOString(), description: 'Weekly pattern detected' },
      { id: '8', type: 'villager_report', location: { lat: 28.6100, lng: 77.2000 }, confidence: 0.33, timestamp: new Date().toISOString(), description: 'School road litter' },
    ];
    setWeakSignals(mockSignals);

    // Simulate AI inference - create hotspots from clustered signals
    const hotspots: InferredHotspot[] = [
      {
        id: 'h1',
        location: { lat: 28.6141, lng: 77.2089, address: 'Near Main Market' },
        confidence: 0.81,
        contributingSignals: 4,
        predictedWasteTypes: ['Plastic', 'Organic', 'Paper'],
        severity: 'high',
        reasoning: [
          '4 independent reports within 50m radius',
          'Near road bend (common dumping spot)',
          'Historical pattern shows 80% recurrence',
          'Market day today - high waste generation',
          'Temperature 32°C - faster decomposition'
        ]
      },
      {
        id: 'h2',
        location: { lat: 28.6202, lng: 77.2150, address: 'Temple Road Junction' },
        confidence: 0.73,
        contributingSignals: 3,
        predictedWasteTypes: ['Organic', 'Flowers', 'Plastic'],
        severity: 'medium',
        reasoning: [
          '3 signals clustered near temple',
          'Weekly pattern detected (festival days)',
          'Voice report matches historical data',
          'High foot traffic area'
        ]
      },
      {
        id: 'h3',
        location: { lat: 28.6100, lng: 77.2000, address: 'School Road' },
        confidence: 0.58,
        contributingSignals: 1,
        predictedWasteTypes: ['Plastic', 'Paper'],
        severity: 'low',
        reasoning: [
          'Single report with context',
          'School timing correlation',
          'Past minor incidents'
        ]
      }
    ];
    setInferredHotspots(hotspots);

    // Predictive alerts
    const alerts: PredictiveAlert[] = [
      {
        id: 'a1',
        location: 'Near Main Market',
        timeframe: 'Next 6 hours',
        confidence: 0.78,
        recommendedAction: 'Dispatch worker immediately to prevent accumulation'
      },
      {
        id: 'a2',
        location: 'Temple Road',
        timeframe: 'Tomorrow morning',
        confidence: 0.65,
        recommendedAction: 'Schedule pre-emptive cleanup before festival'
      }
    ];
    setPredictiveAlerts(alerts);
  }, []);

  const handleInferHotspot = () => {
    setIsProcessing(true);
    toast.info('AI analyzing weak signals...');
    
    setTimeout(() => {
      // Filter hotspots by confidence threshold (>70%)
      const highConfidenceHotspots = inferredHotspots.filter(h => h.confidence >= 0.70);
      
      if (highConfidenceHotspots.length === 0) {
        setIsProcessing(false);
        toast.info('No hotspots above 70% confidence threshold. Continue monitoring.');
        return;
      }
      
      // Create worker jobs from high-confidence hotspots
      const newJobs = highConfidenceHotspots.map((hotspot, index) => ({
        id: `job-${Date.now()}-${index}`,
        location: {
          lat: hotspot.location.lat,
          lng: hotspot.location.lng,
          address: hotspot.location.address
        },
        wasteType: hotspot.predictedWasteTypes.join(', '),
        priority: hotspot.severity,
        status: 'pending',
        jobType: 'AI-Generated Cleanup',
        createdAt: new Date().toISOString(),
        // AI-specific fields
        aiConfidence: hotspot.confidence,
        contributingSignals: hotspot.contributingSignals,
        aiReasoning: hotspot.reasoning,
        routeOptimized: true, // All AI jobs are route-optimized
      }));
      
      // Store jobs in localStorage for Worker App to pick up
      const existingJobs = JSON.parse(localStorage.getItem('workerJobs') || '[]');
      const updatedJobs = [...newJobs, ...existingJobs];
      localStorage.setItem('workerJobs', JSON.stringify(updatedJobs));
      
      // Create SMS notifications for each job
      const smsMessages = newJobs.map((job) => ({
        id: `sms-${Date.now()}-${job.id}`,
        jobId: job.id,
        to: '+91-XXXXXXXXXX',
        message: `🤖 AI Alert: High confidence (${Math.round(job.aiConfidence * 100)}%) hotspot detected at ${job.location.address}. ${job.contributingSignals} signals merged. Waste: ${job.wasteType}. Priority: ${job.priority.toUpperCase()}. Reply 1 to accept.`,
        timestamp: new Date().toISOString(),
        status: 'sent',
        responded: false,
      }));
      
      // Store SMS notifications for Worker App
      const existingSMS = JSON.parse(localStorage.getItem('workerSMS') || '[]');
      const updatedSMS = [...smsMessages, ...existingSMS];
      localStorage.setItem('workerSMS', JSON.stringify(updatedSMS));
      
      setIsProcessing(false);
      
      // Show success message with dispatch details
      toast.success(`AI Inference Complete! ${newJobs.length} job(s) dispatched to workers`, {
        description: `${smsMessages.length} SMS notifications sent. Check Worker App.`,
        duration: 5000,
      });
      
      // Show individual hotspot notifications
      highConfidenceHotspots.forEach((hotspot, index) => {
        setTimeout(() => {
          toast.info(`📍 Job ${index + 1}: ${hotspot.location.address}`, {
            description: `${Math.round(hotspot.confidence * 100)}% confidence - ${hotspot.contributingSignals} signals`,
            duration: 3000,
          });
        }, 500 * (index + 1));
      });
    }, 2000);
  };

  const getSignalColor = (confidence: number) => {
    if (confidence < 0.3) return 'rgba(156, 163, 175, 0.4)'; // Gray - very weak
    if (confidence < 0.4) return 'rgba(59, 130, 246, 0.5)'; // Blue - weak
    return 'rgba(59, 130, 246, 0.7)'; // Stronger blue
  };

  const getHotspotColor = (severity: string) => {
    if (severity === 'high') return 'rgba(239, 68, 68, 0.8)'; // Red
    if (severity === 'medium') return 'rgba(251, 146, 60, 0.7)'; // Orange
    return 'rgba(234, 179, 8, 0.6)'; // Yellow
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Brain className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1">{t('droneMonitoringTitle')}</h1>
              <p className="text-xl opacity-90">{t('droneMonitoringDesc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="text-3xl font-bold">{weakSignals.length}</div>
              <div className="text-sm opacity-90">Weak Signals</div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="text-3xl font-bold">{inferredHotspots.length}</div>
              <div className="text-sm opacity-90">Inferred Hotspots</div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="text-3xl font-bold">{Math.round(inferredHotspots.reduce((acc, h) => acc + h.confidence, 0) / inferredHotspots.length * 100)}%</div>
              <div className="text-sm opacity-90">Avg Confidence</div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="text-3xl font-bold">{predictiveAlerts.length}</div>
              <div className="text-sm opacity-90">Predictive Alerts</div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Weak Signals & Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* AI Process Card */}
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">🧠 Why AI is Essential</h3>
                <p className="text-sm text-gray-700">
                  AI combines {weakSignals.length} weak signals that humans cannot process manually. 
                  <span className="font-semibold"> Spatio-temporal ML predicts waste without direct observation.</span>
                </p>
              </div>
            </div>
            <Badge className="bg-yellow-600 text-white">Impossible without AI</Badge>
          </Card>

          {/* Timeline Selector */}
          <Card className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Timeline View
            </h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={timelineView === 'yesterday' ? 'default' : 'outline'}
                onClick={() => setTimelineView('yesterday')}
                className="flex-1"
              >
                Yesterday
              </Button>
              <Button
                size="sm"
                variant={timelineView === 'today' ? 'default' : 'outline'}
                onClick={() => setTimelineView('today')}
                className="flex-1"
              >
                Today
              </Button>
              <Button
                size="sm"
                variant={timelineView === 'tomorrow' ? 'default' : 'outline'}
                onClick={() => setTimelineView('tomorrow')}
                className="flex-1"
              >
                Tomorrow
              </Button>
            </div>
            {timelineView === 'tomorrow' && (
              <Badge className="w-full mt-2 bg-orange-500 text-white justify-center">
                🔮 Predictive Mode
              </Badge>
            )}
          </Card>

          {/* Weak Signals List */}
          <Card className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Weak Signals ({weakSignals.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {weakSignals.map((signal) => (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                    >
                      {signal.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs font-semibold text-blue-600">
                      {Math.round(signal.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{signal.description}</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${signal.confidence * 100}%` }}
                      className="bg-blue-500 h-1.5 rounded-full"
                      transition={{ duration: 1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* AI Inference Button */}
          <Button
            onClick={handleInferHotspot}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white h-14 text-lg"
          >
            {isProcessing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Brain className="w-5 h-5 mr-2" />
                </motion.div>
                AI Processing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Run AI Inference
              </>
            )}
          </Button>
        </div>

        {/* Center Panel - AI Inference Map */}
        <div className="lg:col-span-2 space-y-4">
          {/* Map Visualization */}
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Inference Map
              </h3>
              <Badge className="bg-purple-100 text-purple-700">
                Spatio-Temporal ML
              </Badge>
            </div>

            {/* Simulated Map */}
            <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl overflow-hidden border-2 border-gray-200">
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-10 grid-rows-10 h-full">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className="border border-gray-400" />
                  ))}
                </div>
              </div>

              {/* Weak Signal Dots */}
              {weakSignals.map((signal, idx) => (
                <motion.div
                  key={signal.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.7, 0.4]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: idx * 0.2
                  }}
                  className="absolute w-4 h-4 rounded-full cursor-pointer"
                  style={{
                    left: `${(signal.location.lng - 77.2) * 5000}%`,
                    top: `${(28.62 - signal.location.lat) * 5000}%`,
                    backgroundColor: getSignalColor(signal.confidence),
                    boxShadow: `0 0 ${signal.confidence * 20}px ${getSignalColor(signal.confidence)}`
                  }}
                  title={`${signal.type}: ${Math.round(signal.confidence * 100)}% confidence`}
                />
              ))}

              {/* Inferred Hotspots */}
              {inferredHotspots.map((hotspot, idx) => (
                <motion.div
                  key={hotspot.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1 + idx * 0.3, duration: 0.5 }}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${(hotspot.location.lng - 77.2) * 5000 - 40}px`,
                    top: `${(28.62 - hotspot.location.lat) * 5000 - 40}px`,
                  }}
                  onClick={() => setSelectedHotspot(hotspot)}
                >
                  {/* Heatmap circle */}
                  <div 
                    className="w-20 h-20 rounded-full relative"
                    style={{
                      backgroundColor: getHotspotColor(hotspot.severity),
                      boxShadow: `0 0 40px ${getHotspotColor(hotspot.severity)}`,
                    }}
                  >
                    {/* Pulsing ring */}
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-4"
                      style={{ borderColor: getHotspotColor(hotspot.severity) }}
                    />
                    
                    {/* Confidence percentage */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {Math.round(hotspot.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs">
                <div className="font-bold mb-2">Legend</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400 opacity-50" />
                    <span>Weak Signal (&lt;30%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-70" />
                    <span>Low Risk Hotspot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500 opacity-70" />
                    <span>Medium Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                    <span>High Risk (&gt;80%)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <Info className="w-4 h-4 inline mr-2" />
                <strong>Dot intensity = AI confidence level.</strong> AI merges weak signals using spatio-temporal analysis to predict waste accumulation without direct observation.
              </p>
            </div>
          </Card>

          {/* Inferred Hotspots List */}
          <Card className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Inferred Hotspots ({inferredHotspots.length})
            </h3>
            <div className="space-y-3">
              {inferredHotspots.map((hotspot) => (
                <motion.div
                  key={hotspot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    hotspot.severity === 'high' 
                      ? 'bg-red-50 border-red-300' 
                      : hotspot.severity === 'medium'
                      ? 'bg-orange-50 border-orange-300'
                      : 'bg-yellow-50 border-yellow-300'
                  }`}
                  onClick={() => {
                    setSelectedHotspot(hotspot);
                    setShowExplainability(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900">{hotspot.location.address}</h4>
                      <p className="text-sm text-gray-600">{hotspot.contributingSignals} signals merged</p>
                    </div>
                    <Badge className={
                      hotspot.severity === 'high' 
                        ? 'bg-red-600' 
                        : hotspot.severity === 'medium'
                        ? 'bg-orange-600'
                        : 'bg-yellow-600'
                    }>
                      {Math.round(hotspot.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {hotspot.predictedWasteTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHotspot(hotspot);
                      setShowExplainability(true);
                    }}
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Why AI decided this?
                  </Button>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Predictive Alerts */}
          {timelineView === 'tomorrow' && (
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                🔮 Predictive Alerts (Tomorrow)
              </h3>
              <div className="space-y-3">
                {predictiveAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{alert.location}</h4>
                      <Badge className="bg-orange-600">{Math.round(alert.confidence * 100)}%</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.timeframe}</p>
                    <div className="p-3 bg-orange-50 rounded border border-orange-200">
                      <p className="text-sm font-semibold text-orange-900">
                        🎯 {alert.recommendedAction}
                      </p>
                    </div>
                    <Badge className="w-full mt-2 bg-green-600 text-white justify-center">
                      Prevention &gt; Reaction
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-purple-100 rounded-lg border border-purple-300">
                <p className="text-sm text-purple-900">
                  <Brain className="w-4 h-4 inline mr-2" />
                  <strong>Time-series ML predicts waste before it appears.</strong> This is impossible without AI.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Explainability Modal */}
      <AnimatePresence>
        {showExplainability && selectedHotspot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowExplainability(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    🤔 Explainable AI
                  </h2>
                  <p className="text-gray-600">Why AI identified this hotspot</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExplainability(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <h3 className="font-bold text-lg mb-2">{selectedHotspot.location.address}</h3>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-purple-600 text-white">
                      {Math.round(selectedHotspot.confidence * 100)}% Confidence
                    </Badge>
                    <Badge variant="outline">
                      {selectedHotspot.contributingSignals} Signals Merged
                    </Badge>
                    <Badge className={
                      selectedHotspot.severity === 'high' ? 'bg-red-600' : 
                      selectedHotspot.severity === 'medium' ? 'bg-orange-600' : 'bg-yellow-600'
                    }>
                      {selectedHotspot.severity.toUpperCase()} Risk
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    AI Reasoning Chain
                  </h4>
                  <div className="space-y-2">
                    {selectedHotspot.reasoning.map((reason, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-gray-700">{reason}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3">Predicted Waste Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedHotspot.predictedWasteTypes.map((type) => (
                      <Badge key={type} className="bg-green-600 text-white">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-300">
                  <h4 className="font-bold mb-2 text-yellow-900">
                    ⚡ Why AI is Essential Here
                  </h4>
                  <p className="text-sm text-yellow-900">
                    Humans cannot manually process {selectedHotspot.contributingSignals} weak signals, 
                    correlate them with historical patterns, weather data, and behavioral trends to 
                    predict waste accumulation. <strong>Spatio-temporal machine learning makes this 
                    inference possible.</strong>
                  </p>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  onClick={() => {
                    setShowExplainability(false);
                    toast.success('Worker dispatched to this location!');
                  }}
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Dispatch Worker to This Hotspot
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}