import React, { useState, useEffect } from 'react';
import { HardHat, MapPin, CheckCircle, Clock, Navigation, MessageSquare, Smartphone, Wifi, WifiOff, Brain, Zap, TrendingUp, Target, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { api } from './api';
import { getTranslation } from './translations';
import { toast } from 'sonner';
import { MapNavigation } from './MapNavigation';

interface WorkerAppProps {
  language: string;
}

export function WorkerApp({ language }: WorkerAppProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [smsNotifications, setSmsNotifications] = useState<any[]>([]);
  const [showSmsPanel, setShowSmsPanel] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [showAIExplainability, setShowAIExplainability] = useState(false);

  const t = (key: string) => getTranslation(language, key);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored! Syncing data...');
      fetchJobs();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.info('You are offline. SMS notifications still work!');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [filter]);

  useEffect(() => {
    // Load SMS notifications from localStorage
    const loadSMSNotifications = () => {
      const sms = JSON.parse(localStorage.getItem('workerSMS') || '[]');
      setSmsNotifications(sms);
    };

    loadSMSNotifications();
    // Check for new SMS every 3 seconds
    const smsInterval = setInterval(loadSMSNotifications, 3000);

    return () => clearInterval(smsInterval);
  }, []);

  const fetchJobs = async () => {
    // Always load from localStorage first (AI-generated jobs are stored here)
    const cachedJobs = localStorage.getItem('workerJobs');
    let localJobs: any[] = [];
    
    if (cachedJobs) {
      try {
        localJobs = JSON.parse(cachedJobs);
      } catch (e) {
        console.error('Error parsing cached jobs:', e);
      }
    }
    
    // If offline, just use local jobs
    if (!isOnline) {
      let filteredJobs = localJobs;
      if (filter !== 'all') {
        filteredJobs = filteredJobs.filter((job: any) => job.status === filter);
      }
      setJobs(filteredJobs);
      setLoading(false);
      return;
    }
    
    // If online, try to fetch from API and merge with local jobs
    try {
      const result = await api.getWorkerJobs();
      if (result.success) {
        const apiJobs = result.data || [];
        
        // Merge local AI-generated jobs with API jobs (avoid duplicates)
        const allJobs = [...localJobs];
        apiJobs.forEach((apiJob: any) => {
          if (!allJobs.find(j => j.id === apiJob.id)) {
            allJobs.push(apiJob);
          }
        });
        
        // Filter by status if needed
        let filteredJobs = allJobs;
        if (filter !== 'all') {
          filteredJobs = allJobs.filter((job: any) => job.status === filter);
        }
        
        setJobs(filteredJobs);
        // Update cache with merged jobs
        localStorage.setItem('workerJobs', JSON.stringify(allJobs));
      } else {
        // API failed, use local jobs
        let filteredJobs = localJobs;
        if (filter !== 'all') {
          filteredJobs = localJobs.filter((job: any) => job.status === filter);
        }
        setJobs(filteredJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // On error, use local jobs
      let filteredJobs = localJobs;
      if (filter !== 'all') {
        filteredJobs = localJobs.filter((job: any) => job.status === filter);
      }
      setJobs(filteredJobs);
      toast.info('Showing AI-generated jobs from local storage');
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, status: string) => {
    // Update locally first (immediate UI feedback)
    const updatedJobs = jobs.map(job => 
      job.id === jobId ? { ...job, status } : job
    );
    setJobs(updatedJobs);
    
    // Update localStorage immediately
    const allLocalJobs = JSON.parse(localStorage.getItem('workerJobs') || '[]');
    const updatedLocalJobs = allLocalJobs.map((job: any) =>
      job.id === jobId ? { ...job, status } : job
    );
    localStorage.setItem('workerJobs', JSON.stringify(updatedLocalJobs));
    
    if (!isOnline) {
      // Queue update for when online
      const pendingUpdates = JSON.parse(localStorage.getItem('pendingUpdates') || '[]');
      pendingUpdates.push({ jobId, status, timestamp: Date.now() });
      localStorage.setItem('pendingUpdates', JSON.stringify(pendingUpdates));
      
      toast.success('Job updated offline! Will sync when online.');
      setSelectedJob(null);
      return;
    }
    
    // Try to update via API if online
    try {
      const result = await api.updateWorkerJob(jobId, { status });
      if (result.success) {
        toast.success(`Job ${status === 'in_progress' ? 'accepted' : status}!`);
        setSelectedJob(null);
        
        // Send SMS notification
        sendSmsNotification(jobId, status);
      } else {
        toast.success('Job updated locally (API sync pending)');
        setSelectedJob(null);
      }
    } catch (error) {
      console.error('Error updating job via API:', error);
      // Job is already updated locally, just notify user
      toast.success('Job updated locally (will sync when possible)');
      setSelectedJob(null);
    }
  };

  const sendSmsNotification = (jobId: string, status: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    const smsMessage = {
      id: `sms-${Date.now()}`,
      jobId,
      to: '+91-XXXXXXXXXX', // Worker's phone number
      message: `SevaSetu Alert: Job at ${job.location?.address || 'location'} - ${job.wasteType}. Status: ${status}. Reply 1 to accept, 0 to decline.`,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
    
    setSmsNotifications(prev => [smsMessage, ...prev]);
    toast.success('SMS notification sent!');
  };

  const handleSmsResponse = (smsId: string, response: '1' | '0') => {
    const sms = smsNotifications.find(s => s.id === smsId);
    if (!sms) return;
    
    if (response === '1') {
      toast.success('Worker accepted via SMS!');
      updateJobStatus(sms.jobId, 'in_progress');
    } else {
      toast.info('Worker declined via SMS.');
    }
    
    // Mark SMS as responded
    setSmsNotifications(prev => 
      prev.map(s => s.id === smsId ? { ...s, responded: response } : s)
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Worker App</h1>
            <p className="text-sm text-gray-500">Cleaning crew management</p>
          </div>
          
          {/* Online/Offline Indicator */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          
          {/* SMS Notifications */}
          <button
            onClick={() => setShowSmsPanel(!showSmsPanel)}
            className="relative p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
          >
            <MessageSquare className="w-5 h-5" />
            {smsNotifications.filter(s => !s.responded).length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                {smsNotifications.filter(s => !s.responded).length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all' as const, label: 'All Jobs', count: jobs.length },
            { id: 'pending' as const, label: 'New', count: jobs.filter(j => j.status === 'pending').length },
            { id: 'in_progress' as const, label: 'In Progress', count: jobs.filter(j => j.status === 'in_progress').length },
            { id: 'completed' as const, label: 'Done', count: jobs.filter(j => j.status === 'completed').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                filter === tab.id
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* SMS Notifications Panel */}
      <AnimatePresence>
        {showSmsPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 border-b border-blue-200 px-4 py-3"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-blue-900">SMS Notifications</h3>
              </div>
              <button
                onClick={() => setShowSmsPanel(false)}
                className="text-blue-700 hover:text-blue-900"
              >
                Close
              </button>
            </div>
            
            {smsNotifications.length === 0 ? (
              <p className="text-sm text-blue-700">No SMS notifications yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto">
                {smsNotifications.map((sms, index) => (
                  <motion.div
                    key={sms.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">
                          To: {sms.to} • {new Date(sms.timestamp).toLocaleTimeString()}
                        </div>
                        <p className="text-sm text-gray-900">{sms.message}</p>
                      </div>
                    </div>
                    
                    {!sms.responded && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSmsResponse(sms.id, '1')}
                          className="flex-1 bg-green-500 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-green-600 transition-colors duration-200"
                        >
                          Press 1 - Accept
                        </button>
                        <button
                          onClick={() => handleSmsResponse(sms.id, '0')}
                          className="flex-1 bg-red-500 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-red-600 transition-colors duration-200"
                        >
                          Press 0 - Decline
                        </button>
                      </div>
                    )}
                    
                    {sms.responded && (
                      <div className={`mt-2 px-3 py-1 rounded-lg text-sm font-medium inline-block ${
                        sms.responded === '1' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {sms.responded === '1' ? '✓ Accepted' : '✗ Declined'}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job List */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <CheckCircle className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No jobs found</p>
            <p className="text-sm">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job, index) => (
              <motion.button
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedJob(job)}
                className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-4 text-left"
              >
                <div className="flex items-start gap-4">
                  {/* Priority Indicator */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    job.priority === 'high' ? 'bg-red-100' :
                    job.priority === 'medium' ? 'bg-orange-100' :
                    'bg-blue-100'
                  }`}>
                    <MapPin className={`w-6 h-6 ${
                      job.priority === 'high' ? 'text-red-600' :
                      job.priority === 'medium' ? 'text-orange-600' :
                      'text-blue-600'
                    }`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">
                        Job #{job.id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        job.priority === 'high' ? 'bg-red-100 text-red-700' :
                        job.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{job.wasteType}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{job.location?.address || 'Location available'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(job.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    
                    {/* AI Information */}
                    {job.aiConfidence && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-md">
                          <Brain className="w-3 h-3 text-purple-600" />
                          <span className="text-xs font-medium text-purple-700">
                            AI: {Math.round(job.aiConfidence * 100)}% confident
                          </span>
                        </div>
                        {job.routeOptimized && (
                          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md">
                            <Target className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-medium text-green-700">
                              Route optimized
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    job.status === 'completed' ? 'bg-green-100 text-green-700' :
                    job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {job.status === 'completed' ? 'Done' :
                     job.status === 'in_progress' ? 'In Progress' :
                     'New'}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-center p-4"
          onClick={() => setSelectedJob(null)}
        >
          <motion.div
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-3xl md:rounded-3xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6 md:hidden" />

            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                selectedJob.priority === 'high' ? 'bg-red-100' :
                selectedJob.priority === 'medium' ? 'bg-orange-100' :
                'bg-blue-100'
              }`}>
                <MapPin className={`w-8 h-8 ${
                  selectedJob.priority === 'high' ? 'text-red-600' :
                  selectedJob.priority === 'medium' ? 'text-orange-600' :
                  'text-blue-600'
                }`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Job #{selectedJob.id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-sm text-gray-500">{selectedJob.jobType}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Waste Type</div>
                <div className="font-medium text-gray-900">{selectedJob.wasteType}</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Location</div>
                <div className="font-medium text-gray-900">
                  {selectedJob.location?.address || 'Rampur Village - Near main road'}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Priority</div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedJob.priority === 'high' ? 'bg-red-100 text-red-700' :
                    selectedJob.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedJob.priority.charAt(0).toUpperCase() + selectedJob.priority.slice(1)}
                  </span>
                </div>
              </div>
              
              {/* AI Information Section */}
              {selectedJob.aiConfidence && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h4 className="font-bold text-purple-900">AI Inference Details</h4>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-700">Confidence Level</span>
                      <span className="font-bold text-purple-900">{Math.round(selectedJob.aiConfidence * 100)}%</span>
                    </div>
                    
                    {selectedJob.contributingSignals && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-700">Contributing Signals</span>
                        <span className="font-bold text-purple-900">{selectedJob.contributingSignals}</span>
                      </div>
                    )}
                    
                    {selectedJob.routeOptimized && (
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">Part of optimized route - 35% time savings</span>
                      </div>
                    )}
                  </div>
                  
                  {selectedJob.aiReasoning && selectedJob.aiReasoning.length > 0 && (
                    <div>
                      <button
                        onClick={() => setShowAIExplainability(!showAIExplainability)}
                        className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium"
                      >
                        <Info className="w-4 h-4" />
                        {showAIExplainability ? 'Hide' : 'Show'} AI Reasoning
                      </button>
                      
                      {showAIExplainability && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 space-y-2"
                        >
                          {selectedJob.aiReasoning.map((reason: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 bg-white rounded-lg p-2">
                              <div className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                {idx + 1}
                              </div>
                              <p className="text-xs text-gray-700 flex-1">{reason}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {selectedJob.status === 'pending' && (
                <button
                  onClick={() => {
                    updateJobStatus(selectedJob.id, 'in_progress');
                    setShowNavigation(true);
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200"
                >
                  <Navigation className="w-5 h-5" />
                  Start Job & Navigate
                </button>
              )}

              {selectedJob.status === 'in_progress' && (
                <>
                  <button
                    onClick={() => setShowNavigation(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200"
                  >
                    <Navigation className="w-5 h-5" />
                    Navigate to Location
                  </button>
                  <button
                    onClick={() => updateJobStatus(selectedJob.id, 'completed')}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Completed
                  </button>
                </>
              )}

              <button
                onClick={() => setSelectedJob(null)}
                className="w-full bg-gray-100 text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Map Navigation for Worker Jobs */}
      <AnimatePresence>
        {showNavigation && selectedJob && (
          <MapNavigation
            destination={{
              name: `Job #${selectedJob.id.slice(-6).toUpperCase()}`,
              address: selectedJob.location?.address || 'Rampur Village - Near main road',
              lat: selectedJob.location?.lat || 27.5665,
              lng: selectedJob.location?.lng || 80.6830,
              type: 'job',
            }}
            onClose={() => {
              setShowNavigation(false);
            }}
            onArrived={() => {
              setShowNavigation(false);
              toast.success('Arrived at location! Complete the job when done.');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}