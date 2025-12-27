/**
 * SystemSync - Central synchronization hub for all 4 interconnected portals
 * Ensures real-time data flow: Villager → AI Engine → Worker → Dashboard
 */

export interface WasteReport {
  id: string;
  userId: string;
  type: 'scan' | 'voice' | 'report';
  category: string;
  confidence: number;
  location: { lat: number; lng: number; address: string };
  timestamp: string;
  description?: string;
  photoUrl?: string;
}

export interface WeakSignal {
  id: string;
  type: 'villager_report' | 'voice_only' | 'worker_movement' | 'historical_pattern';
  location: { lat: number; lng: number };
  confidence: number;
  timestamp: string;
  description: string;
  sourceReportId?: string;
}

export interface WorkerJob {
  id: string;
  location: { lat: number; lng: number; address: string };
  wasteType: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'accepted' | 'in-progress' | 'completed';
  jobType: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  workerId?: string;
  workerName?: string;
  aiConfidence?: number;
  contributingSignals?: number;
  aiReasoning?: string[];
  routeOptimized?: boolean;
  beforePhoto?: string;
  afterPhoto?: string;
}

export interface DashboardMetrics {
  totalReports: number;
  activeJobs: number;
  completedJobs: number;
  activeHotspots: number;
  cleanlinessScore: number;
  responseTime: number; // minutes
  wasteCollected: number; // kg
  aiAccuracy: number; // percentage
  villagesManaged: number;
  lastUpdated: string;
}

class SystemSyncManager {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startSync();
  }

  /**
   * Start real-time synchronization across all systems
   */
  startSync() {
    // Sync every 3 seconds for real-time updates
    this.syncInterval = setInterval(() => {
      this.notifyAll('sync', { timestamp: new Date().toISOString() });
    }, 3000);

    // Listen to localStorage changes from other tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this));
    }
  }

  /**
   * Stop synchronization
   */
  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Handle localStorage changes from other tabs/windows
   */
  private handleStorageChange(event: StorageEvent) {
    if (!event.key) return;

    const eventType = event.key.replace('Storage', '');
    this.notifyAll(eventType, event.newValue ? JSON.parse(event.newValue) : null);
  }

  /**
   * Subscribe to data changes
   */
  subscribe(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Notify all listeners of an event
   */
  private notifyAll(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * VILLAGER APP → AI INFERENCE ENGINE
   * Convert waste reports to weak signals
   */
  addWasteReport(report: WasteReport): WeakSignal {
    // Store report
    const reports = this.getWasteReports();
    reports.unshift(report);
    localStorage.setItem('wasteReports', JSON.stringify(reports));

    // Create weak signal from report
    const weakSignal: WeakSignal = {
      id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: report.type === 'voice' ? 'voice_only' : 'villager_report',
      location: { lat: report.location.lat, lng: report.location.lng },
      confidence: report.confidence / 100, // Convert to 0-1 range
      timestamp: report.timestamp,
      description: report.description || `${report.category} waste reported`,
      sourceReportId: report.id,
    };

    // Add to weak signals
    const signals = this.getWeakSignals();
    signals.unshift(weakSignal);
    localStorage.setItem('weakSignals', JSON.stringify(signals));

    // Notify AI Inference Engine
    this.notifyAll('newWeakSignal', weakSignal);
    this.notifyAll('newWasteReport', report);

    return weakSignal;
  }

  /**
   * AI INFERENCE ENGINE → WORKER APP
   * Create jobs from AI inferred hotspots
   */
  createWorkerJob(job: WorkerJob) {
    const jobs = this.getWorkerJobs();
    jobs.unshift(job);
    localStorage.setItem('workerJobs', JSON.stringify(jobs));

    // Notify Worker App
    this.notifyAll('newWorkerJob', job);
    
    // Update dashboard metrics
    this.updateDashboardMetrics();

    return job;
  }

  /**
   * WORKER APP → DASHBOARD
   * Update job status and metrics
   */
  updateJobStatus(jobId: string, status: WorkerJob['status'], updates: Partial<WorkerJob> = {}) {
    const jobs = this.getWorkerJobs();
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    
    if (jobIndex !== -1) {
      jobs[jobIndex] = {
        ...jobs[jobIndex],
        status,
        ...updates,
        ...(status === 'accepted' && { acceptedAt: new Date().toISOString() }),
        ...(status === 'completed' && { completedAt: new Date().toISOString() }),
      };
      
      localStorage.setItem('workerJobs', JSON.stringify(jobs));

      // If completed, add to completed jobs
      if (status === 'completed') {
        const completed = this.getCompletedJobs();
        completed.unshift(jobs[jobIndex]);
        localStorage.setItem('completedJobs', JSON.stringify(completed));
        
        // Notify dashboard
        this.notifyAll('jobCompleted', jobs[jobIndex]);
      }

      // Notify all systems
      this.notifyAll('jobStatusChanged', { jobId, status, job: jobs[jobIndex] });
      
      // Update dashboard metrics
      this.updateDashboardMetrics();
    }
  }

  /**
   * Get all waste reports (Villager App data)
   */
  getWasteReports(): WasteReport[] {
    try {
      return JSON.parse(localStorage.getItem('wasteReports') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Get weak signals (AI Engine input)
   */
  getWeakSignals(): WeakSignal[] {
    try {
      return JSON.parse(localStorage.getItem('weakSignals') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Get worker jobs (Worker App data)
   */
  getWorkerJobs(): WorkerJob[] {
    try {
      return JSON.parse(localStorage.getItem('workerJobs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Get completed jobs (Dashboard data)
   */
  getCompletedJobs(): WorkerJob[] {
    try {
      return JSON.parse(localStorage.getItem('completedJobs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Calculate and update dashboard metrics from all systems
   */
  updateDashboardMetrics(): DashboardMetrics {
    const reports = this.getWasteReports();
    const jobs = this.getWorkerJobs();
    const completed = this.getCompletedJobs();

    const activeJobs = jobs.filter(j => j.status === 'pending' || j.status === 'accepted' || j.status === 'in-progress');
    const completedJobs = jobs.filter(j => j.status === 'completed');

    // Calculate response time (average time from creation to completion)
    let totalResponseTime = 0;
    let responseCount = 0;
    completedJobs.forEach(job => {
      if (job.completedAt && job.createdAt) {
        const responseMs = new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime();
        totalResponseTime += responseMs / 60000; // Convert to minutes
        responseCount++;
      }
    });
    const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 15;

    // Calculate cleanliness score (0-100)
    const recentReports = reports.filter(r => {
      const hoursSince = (Date.now() - new Date(r.timestamp).getTime()) / 3600000;
      return hoursSince <= 24;
    });
    const cleanlinessScore = Math.max(0, Math.min(100, 100 - recentReports.length * 2 + completedJobs.length * 5));

    // Calculate AI accuracy (based on confidence levels)
    const aiJobs = jobs.filter(j => j.aiConfidence);
    const avgAIAccuracy = aiJobs.length > 0
      ? Math.round(aiJobs.reduce((sum, j) => sum + (j.aiConfidence || 0), 0) / aiJobs.length * 100)
      : 85;

    // Calculate waste collected (estimated from completed jobs)
    const wasteCollected = completedJobs.length * 12; // Avg 12kg per job

    // Calculate active hotspots (high confidence weak signals clusters)
    const signals = this.getWeakSignals();
    const highConfidenceSignals = signals.filter(s => s.confidence > 0.6);
    const activeHotspots = Math.ceil(highConfidenceSignals.length / 3); // Cluster every 3 signals

    const metrics: DashboardMetrics = {
      totalReports: reports.length,
      activeJobs: activeJobs.length,
      completedJobs: completedJobs.length,
      activeHotspots,
      cleanlinessScore: Math.round(cleanlinessScore),
      responseTime: avgResponseTime,
      wasteCollected,
      aiAccuracy: avgAIAccuracy,
      villagesManaged: 1, // Can be expanded
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem('dashboardMetrics', JSON.stringify(metrics));
    this.notifyAll('metricsUpdated', metrics);

    return metrics;
  }

  /**
   * Get current dashboard metrics
   */
  getDashboardMetrics(): DashboardMetrics {
    try {
      const stored = localStorage.getItem('dashboardMetrics');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    
    // If no metrics exist, calculate them
    return this.updateDashboardMetrics();
  }

  /**
   * Clear all data (for testing/demo reset)
   */
  clearAllData() {
    localStorage.removeItem('wasteReports');
    localStorage.removeItem('weakSignals');
    localStorage.removeItem('workerJobs');
    localStorage.removeItem('completedJobs');
    localStorage.removeItem('dashboardMetrics');
    localStorage.removeItem('workerSMS');
    
    this.notifyAll('dataCleared', { timestamp: new Date().toISOString() });
  }

  /**
   * Get system health status
   */
  getSystemHealth() {
    const reports = this.getWasteReports();
    const signals = this.getWeakSignals();
    const jobs = this.getWorkerJobs();
    const metrics = this.getDashboardMetrics();

    return {
      villagerApp: {
        status: 'operational',
        reportsToday: reports.filter(r => {
          const hoursSince = (Date.now() - new Date(r.timestamp).getTime()) / 3600000;
          return hoursSince <= 24;
        }).length,
        lastActivity: reports[0]?.timestamp || null,
      },
      aiEngine: {
        status: 'operational',
        weakSignalsActive: signals.length,
        inferenceAccuracy: metrics.aiAccuracy,
        lastInference: signals[0]?.timestamp || null,
      },
      workerApp: {
        status: 'operational',
        pendingJobs: jobs.filter(j => j.status === 'pending').length,
        activeJobs: jobs.filter(j => j.status === 'accepted' || j.status === 'in-progress').length,
        completedToday: jobs.filter(j => {
          if (!j.completedAt) return false;
          const hoursSince = (Date.now() - new Date(j.completedAt).getTime()) / 3600000;
          return hoursSince <= 24;
        }).length,
      },
      dashboard: {
        status: 'operational',
        cleanlinessScore: metrics.cleanlinessScore,
        responseTime: metrics.responseTime,
        lastUpdate: metrics.lastUpdated,
      },
    };
  }
}

// Singleton instance
export const systemSync = new SystemSyncManager();

// Export for use in components
export default systemSync;
