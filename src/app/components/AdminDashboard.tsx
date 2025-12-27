import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, Download, BarChart3, Users, Activity, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { api } from './api';
import { getTranslation } from './translations';
import { systemSync, type DashboardMetrics } from './SystemSync';
import { toast } from 'sonner';

interface AdminDashboardProps {
  language: string;
}

export function AdminDashboard({ language }: AdminDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [view, setView] = useState<'overview' | 'compare' | 'reports'>('overview');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [lastSync, setLastSync] = useState<string>('');

  const t = (key: string) => getTranslation(language, key);

  useEffect(() => {
    // Initial load
    loadRealTimeData();

    // Subscribe to system sync events
    const unsubscribeMetrics = systemSync.subscribe('metricsUpdated', (data) => {
      setMetrics(data);
      setLastSync(new Date().toLocaleTimeString());
    });

    const unsubscribeJobCompleted = systemSync.subscribe('jobCompleted', (job) => {
      toast.success(`✅ Job completed: ${job.location.address}`, {
        description: `Response time: ${calculateResponseTime(job)} minutes`,
      });
      loadRealTimeData();
    });

    const unsubscribeSync = systemSync.subscribe('sync', () => {
      loadRealTimeData();
    });

    // Refresh every 3 seconds
    const interval = setInterval(loadRealTimeData, 3000);

    return () => {
      unsubscribeMetrics();
      unsubscribeJobCompleted();
      unsubscribeSync();
      clearInterval(interval);
    };
  }, []);

  const loadRealTimeData = () => {
    const liveMetrics = systemSync.getDashboardMetrics();
    const health = systemSync.getSystemHealth();
    setMetrics(liveMetrics);
    setSystemHealth(health);
    setLoading(false);
    setLastSync(new Date().toLocaleTimeString());
  };

  const calculateResponseTime = (job: any): number => {
    if (!job.completedAt || !job.createdAt) return 0;
    const ms = new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime();
    return Math.round(ms / 60000); // Convert to minutes
  };

  const villages = [
    { name: 'Rampur', score: 78, waste: 245, trend: '+5%' },
    { name: 'Chandanpur', score: 82, waste: 198, trend: '+8%' },
    { name: 'Manjhauli', score: 71, waste: 312, trend: '+2%' },
  ];

  const categoryData = stats?.categoryDistribution 
    ? Object.entries(stats.categoryDistribution).map(([name, value]) => ({ name, value }))
    : [
        { name: 'Plastic', value: 45 },
        { name: 'Organic', value: 30 },
        { name: 'Glass', value: 12 },
        { name: 'Metal', value: 8 },
        { name: 'Hazardous', value: 5 },
      ];

  const COLORS = ['#3B82F6', '#10B981', '#06B6D4', '#6B7280', '#EF4444'];

  const weeklyData = [
    { day: 'Mon', waste: 45 },
    { day: 'Tue', waste: 52 },
    { day: 'Wed', waste: 38 },
    { day: 'Thu', waste: 61 },
    { day: 'Fri', waste: 48 },
    { day: 'Sat', waste: 55 },
    { day: 'Sun', waste: 42 },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Panchayat & Analytics Portal</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors duration-200">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
            { id: 'compare' as const, label: 'Village Compare', icon: TrendingUp },
            { id: 'reports' as const, label: 'Reports', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                  view === tab.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {view === 'overview' && (
          <div className="space-y-6">
            {/* System Health Banner */}
            {systemHealth && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-bold text-gray-900">All Systems Operational</div>
                      <div className="text-sm text-gray-600">
                        Last sync: {lastSync} • {metrics?.totalReports} reports • {metrics?.completedJobs} jobs completed
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-600 font-medium">LIVE</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-500">Waste Collected</div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">♻️</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {metrics?.wasteCollected || 0} kg
                </div>
                <div className="text-sm text-green-600">From {metrics?.completedJobs || 0} completed jobs</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-500">Active Hotspots</div>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🔥</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {metrics?.activeHotspots || 0}
                </div>
                <div className="text-sm text-red-600">{metrics?.activeJobs || 0} jobs pending</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-500">Response Time</div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">⚡</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {metrics?.responseTime || 0} min
                </div>
                <div className="text-sm text-blue-600">Average completion time</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-500">Cleanliness Score</div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🌟</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {metrics?.cleanlinessScore || 0}%
                </div>
                <div className="text-sm text-purple-600">AI Accuracy: {metrics?.aiAccuracy || 0}%</div>
              </motion.div>
            </div>

            {/* AI Learning Metrics Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-xl p-6 text-white"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-1">🧠 AI Learning Metrics</h3>
                  <p className="text-sm opacity-90">Real-time AI performance & continuous improvement</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-xs opacity-75">AI Accuracy</div>
                  <div className="text-2xl font-bold">{metrics?.aiAccuracy || 85}%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-xs opacity-75 mb-1">Weak Signals</div>
                  <div className="text-2xl font-bold">{systemHealth?.aiEngine?.weakSignalsActive || 0}</div>
                  <div className="text-xs opacity-75 mt-1">Being analyzed</div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-xs opacity-75 mb-1">Jobs Dispatched</div>
                  <div className="text-2xl font-bold">{metrics?.totalReports || 0}</div>
                  <div className="text-xs opacity-75 mt-1">Via AI inference</div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-xs opacity-75 mb-1">Villages Managed</div>
                  <div className="text-2xl font-bold">{metrics?.villagesManaged || 1}</div>
                  <div className="text-xs opacity-75 mt-1">Zero hardware added</div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-xs opacity-75 mb-1">Response Time</div>
                  <div className="text-2xl font-bold">{metrics?.responseTime || 0}min</div>
                  <div className="text-xs opacity-75 mt-1">AI optimized routes</div>
                </div>
              </div>

              <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-xs opacity-75 mb-2">Continuous Learning Feedback Loop</div>
                <div className="flex items-center justify-between text-xs">
                  <span>📊 Data</span>
                  <span className="opacity-50">→</span>
                  <span>🔍 Patterns</span>
                  <span className="opacity-50">→</span>
                  <span>🎯 Predictions</span>
                  <span className="opacity-50">→</span>
                  <span>⚡ Actions</span>
                  <span className="opacity-50">→</span>
                  <span>📈 Model Updates</span>
                </div>
              </div>
            </motion.div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Waste Collection</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="day" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Line type="monotone" dataKey="waste" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Category Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Waste Category Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Jobs Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Worker Jobs Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="text-2xl font-bold text-yellow-700 mb-1">
                    {stats?.pendingJobs || 5}
                  </div>
                  <div className="text-sm text-yellow-600">Pending Jobs</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-700 mb-1">3</div>
                  <div className="text-sm text-blue-600">In Progress</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-700 mb-1">
                    {stats?.completedJobs || 28}
                  </div>
                  <div className="text-sm text-green-600">Completed Today</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {view === 'compare' && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6">Village Performance Comparison</h3>
              
              <div className="space-y-4">
                {villages.map((village, index) => (
                  <motion.div
                    key={village.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-xl p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{village.name}</h4>
                        <p className="text-sm text-gray-500">Sitapur District</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{village.score}%</div>
                        <div className="text-xs text-green-600">{village.trend}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Waste Collected</div>
                        <div className="font-bold text-gray-900">{village.waste} kg</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Active Users</div>
                        <div className="font-bold text-gray-900">{Math.floor(Math.random() * 100) + 50}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Reports</div>
                        <div className="font-bold text-gray-900">{Math.floor(Math.random() * 30) + 10}</div>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          village.score >= 80 ? 'bg-green-500' :
                          village.score >= 70 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${village.score}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5"
              >
                <h4 className="font-bold text-gray-900 mb-2">District Level Impact</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Sitapur district has collected 755 kg of waste this month across 3 villages, with an average cleanliness score of 77%.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-sm text-gray-500">District Rank</div>
                    <div className="text-xl font-bold text-purple-600">#12 / 72</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-sm text-gray-500">State Rank</div>
                    <div className="text-xl font-bold text-blue-600">#145 / 820</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Scalability Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6">Scalability Overview</h3>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🏘️</span>
                  </div>
                  <div className="font-bold text-gray-900">3 Villages</div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
                <div className="text-2xl text-gray-300">→</div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-3xl">🏛️</span>
                  </div>
                  <div className="font-bold text-gray-900">1 Block</div>
                  <div className="text-xs text-gray-500">Sitapur</div>
                </div>
                <div className="text-2xl text-gray-300">→</div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-4xl">🗺️</span>
                  </div>
                  <div className="font-bold text-gray-900">District Level</div>
                  <div className="text-xs text-gray-500">Expandable</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {view === 'reports' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6">Export Reports</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 text-left hover:shadow-xl transition-all duration-200">
                <div className="text-3xl mb-2">📊</div>
                <div className="font-bold mb-1">Monthly Summary</div>
                <div className="text-sm opacity-90">Waste collection & cleanliness report</div>
              </button>

              <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 text-left hover:shadow-xl transition-all duration-200">
                <div className="text-3xl mb-2">📈</div>
                <div className="font-bold mb-1">Performance Metrics</div>
                <div className="text-sm opacity-90">KPIs for government reporting</div>
              </button>

              <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 text-left hover:shadow-xl transition-all duration-200">
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-bold mb-1">Village Comparison</div>
                <div className="text-sm opacity-90">Comparative analysis across region</div>
              </button>

              <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 text-left hover:shadow-xl transition-all duration-200">
                <div className="text-3xl mb-2">💼</div>
                <div className="font-bold mb-1">CSR Report</div>
                <div className="text-sm opacity-90">For corporate partnerships</div>
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h4 className="font-bold text-gray-900 mb-3">Custom Report Builder</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                    <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none">
                    <option>PDF</option>
                    <option>CSV</option>
                    <option>Excel</option>
                  </select>
                </div>
                <button className="w-full bg-purple-500 text-white rounded-lg py-3 font-medium hover:bg-purple-600 transition-colors duration-200">
                  Generate Custom Report
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}