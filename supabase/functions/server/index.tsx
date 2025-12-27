import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Helper function to generate IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ==================== WASTE REPORTS ====================
app.post('/make-server-073443c7/waste-reports', async (c) => {
  try {
    const body = await c.req.json();
    const report = {
      id: generateId(),
      userId: body.userId || 'anonymous',
      type: body.type, // 'scan' or 'voice'
      category: body.category, // 'Plastic', 'Organic', 'Glass', 'Metal', 'Hazardous'
      confidence: body.confidence || 0,
      location: body.location,
      imageUrl: body.imageUrl,
      description: body.description,
      status: 'identified',
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`waste_report:${report.id}`, report);
    return c.json({ success: true, data: report });
  } catch (error) {
    console.log(`Error creating waste report: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get('/make-server-073443c7/waste-reports', async (c) => {
  try {
    const reports = await kv.getByPrefix('waste_report:');
    const sortedReports = reports.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return c.json({ success: true, data: sortedReports });
  } catch (error) {
    console.log(`Error fetching waste reports: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== LITTER REPORTS ====================
app.post('/make-server-073443c7/litter-reports', async (c) => {
  try {
    const body = await c.req.json();
    const report = {
      id: generateId(),
      reporterId: body.reporterId || 'anonymous',
      location: body.location,
      description: body.description,
      imageUrl: body.imageUrl,
      status: 'reported',
      priority: body.priority || 'medium',
      workerId: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    
    await kv.set(`litter_report:${report.id}`, report);
    
    // Auto-create a worker job
    const job = {
      id: generateId(),
      workerId: null,
      jobType: 'litter_cleanup',
      location: body.location,
      wasteType: body.description,
      status: 'pending',
      priority: body.priority || 'medium',
      reportId: report.id,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    await kv.set(`worker_job:${job.id}`, job);
    
    return c.json({ success: true, data: report });
  } catch (error) {
    console.log(`Error creating litter report: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get('/make-server-073443c7/litter-reports', async (c) => {
  try {
    const reports = await kv.getByPrefix('litter_report:');
    const sortedReports = reports.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return c.json({ success: true, data: sortedReports });
  } catch (error) {
    console.log(`Error fetching litter reports: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== WORKER JOBS ====================
app.get('/make-server-073443c7/worker-jobs', async (c) => {
  try {
    const status = c.req.query('status');
    const jobs = await kv.getByPrefix('worker_job:');
    
    let filteredJobs = jobs;
    if (status) {
      filteredJobs = jobs.filter((job: any) => job.status === status);
    }
    
    const sortedJobs = filteredJobs.sort((a: any, b: any) => {
      const priorityOrder: any = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
    
    return c.json({ success: true, data: sortedJobs });
  } catch (error) {
    console.log(`Error fetching worker jobs: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.patch('/make-server-073443c7/worker-jobs/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const job = await kv.get(`worker_job:${id}`);
    
    if (!job) {
      return c.json({ success: false, error: 'Job not found' }, 404);
    }
    
    const updatedJob = {
      ...job,
      ...body,
      completedAt: body.status === 'completed' ? new Date().toISOString() : job.completedAt,
    };
    
    await kv.set(`worker_job:${id}`, updatedJob);
    
    // Update related litter report if exists
    if (updatedJob.reportId) {
      const report = await kv.get(`litter_report:${updatedJob.reportId}`);
      if (report) {
        report.status = body.status === 'completed' ? 'cleaned' : 'in_progress';
        await kv.set(`litter_report:${updatedJob.reportId}`, report);
      }
    }
    
    return c.json({ success: true, data: updatedJob });
  } catch (error) {
    console.log(`Error updating worker job: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Alternative PUT endpoint for compatibility
app.put('/make-server-073443c7/worker-jobs/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const job = await kv.get(`worker_job:${id}`);
    
    if (!job) {
      return c.json({ success: false, error: 'Job not found' }, 404);
    }
    
    const updatedJob = {
      ...job,
      ...body,
      completedAt: body.status === 'completed' ? new Date().toISOString() : job.completedAt,
    };
    
    await kv.set(`worker_job:${id}`, updatedJob);
    
    // Update related litter report if exists
    if (updatedJob.reportId) {
      const report = await kv.get(`litter_report:${updatedJob.reportId}`);
      if (report) {
        report.status = body.status === 'completed' ? 'cleaned' : 'in_progress';
        await kv.set(`litter_report:${updatedJob.reportId}`, report);
      }
    }
    
    return c.json({ success: true, data: updatedJob });
  } catch (error) {
    console.log(`Error updating worker job: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== DRONE DETECTIONS ====================
app.post('/make-server-073443c7/drone-detections', async (c) => {
  try {
    const body = await c.req.json();
    const detection = {
      id: generateId(),
      location: body.location,
      wasteTypes: body.wasteTypes || [],
      severity: body.severity, // 'low', 'medium', 'high'
      imageUrl: body.imageUrl,
      area: body.area,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`drone_detection:${detection.id}`, detection);
    
    // Auto-create worker job for high severity
    if (detection.severity === 'high') {
      const job = {
        id: generateId(),
        workerId: null,
        jobType: 'drone_detected',
        location: body.location,
        wasteType: body.wasteTypes.join(', '),
        status: 'pending',
        priority: 'high',
        detectionId: detection.id,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      await kv.set(`worker_job:${job.id}`, job);
    }
    
    return c.json({ success: true, data: detection });
  } catch (error) {
    console.log(`Error creating drone detection: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get('/make-server-073443c7/drone-detections', async (c) => {
  try {
    const detections = await kv.getByPrefix('drone_detection:');
    const sortedDetections = detections.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return c.json({ success: true, data: sortedDetections });
  } catch (error) {
    console.log(`Error fetching drone detections: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== VILLAGES & STATS ====================
app.get('/make-server-073443c7/villages', async (c) => {
  try {
    const villages = await kv.getByPrefix('village:');
    return c.json({ success: true, data: villages });
  } catch (error) {
    console.log(`Error fetching villages: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get('/make-server-073443c7/stats', async (c) => {
  try {
    const wasteReports = await kv.getByPrefix('waste_report:');
    const litterReports = await kv.getByPrefix('litter_report:');
    const workerJobs = await kv.getByPrefix('worker_job:');
    const droneDetections = await kv.getByPrefix('drone_detection:');
    
    // Calculate stats
    const totalWasteCollected = wasteReports.length * 2.5; // avg 2.5kg per report
    const activeHotspots = droneDetections.filter((d: any) => d.severity === 'high').length;
    const completedJobs = workerJobs.filter((j: any) => j.status === 'completed').length;
    const pendingJobs = workerJobs.filter((j: any) => j.status === 'pending').length;
    const cleanedReports = litterReports.filter((r: any) => r.status === 'cleaned').length;
    
    // Calculate average response time (in hours)
    const completedJobsWithTime = workerJobs.filter((j: any) => j.status === 'completed' && j.completedAt);
    const avgResponseTime = completedJobsWithTime.length > 0
      ? completedJobsWithTime.reduce((acc: number, job: any) => {
          const created = new Date(job.createdAt).getTime();
          const completed = new Date(job.completedAt).getTime();
          return acc + (completed - created) / (1000 * 60 * 60); // hours
        }, 0) / completedJobsWithTime.length
      : 0;
    
    // Category distribution
    const categoryDist: any = {};
    wasteReports.forEach((r: any) => {
      categoryDist[r.category] = (categoryDist[r.category] || 0) + 1;
    });
    
    const stats = {
      totalWasteCollected: Math.round(totalWasteCollected * 10) / 10,
      activeHotspots,
      responseTime: Math.round(avgResponseTime * 10) / 10,
      cleanlinessScore: Math.min(95, Math.round(70 + (cleanedReports / Math.max(1, litterReports.length)) * 25)),
      completedJobs,
      pendingJobs,
      categoryDistribution: categoryDist,
      recentActivity: [...wasteReports, ...litterReports, ...droneDetections]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10),
    };
    
    return c.json({ success: true, data: stats });
  } catch (error) {
    console.log(`Error fetching stats: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== SEED DATA ====================
app.post('/make-server-073443c7/seed-data', async (c) => {
  try {
    // Seed some initial villages
    const villages = [
      { id: 'v1', name: 'Rampur', district: 'Sitapur', state: 'Uttar Pradesh', cleanlinessScore: 78 },
      { id: 'v2', name: 'Chandanpur', district: 'Sitapur', state: 'Uttar Pradesh', cleanlinessScore: 82 },
      { id: 'v3', name: 'Manjhauli', district: 'Sitapur', state: 'Uttar Pradesh', cleanlinessScore: 71 },
    ];
    
    for (const village of villages) {
      await kv.set(`village:${village.id}`, village);
    }
    
    // Seed some sample data for demo
    const sampleWasteReport = {
      id: generateId(),
      userId: 'demo-user',
      type: 'scan',
      category: 'Plastic',
      confidence: 94,
      location: { lat: 27.5667, lng: 80.6833, address: 'Rampur Village Center' },
      imageUrl: null,
      description: 'Plastic bottle',
      status: 'identified',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    };
    await kv.set(`waste_report:${sampleWasteReport.id}`, sampleWasteReport);
    
    const sampleDetection = {
      id: generateId(),
      location: { lat: 27.5670, lng: 80.6840, area: 'Near pond' },
      wasteTypes: ['Plastic', 'Mixed Waste'],
      severity: 'high',
      imageUrl: null,
      area: 'North sector',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    };
    await kv.set(`drone_detection:${sampleDetection.id}`, sampleDetection);
    
    return c.json({ success: true, message: 'Sample data seeded' });
  } catch (error) {
    console.log(`Error seeding data: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Health check
app.get('/make-server-073443c7/health', (c) => {
  return c.json({ status: 'ok', service: 'SevaSetu API' });
});

Deno.serve(app.fetch);