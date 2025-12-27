import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-073443c7`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

export const api = {
  // Waste Reports
  createWasteReport: async (data: any) => {
    const response = await fetch(`${BASE_URL}/waste-reports`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getWasteReports: async () => {
    const response = await fetch(`${BASE_URL}/waste-reports`, {
      method: 'GET',
      headers,
    });
    return response.json();
  },

  updateWasteReport: async (id: string, data: any) => {
    const response = await fetch(`${BASE_URL}/waste-reports/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // AI Inferences
  createAIInference: async (data: any) => {
    const response = await fetch(`${BASE_URL}/ai-inferences`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getAIInferences: async () => {
    const response = await fetch(`${BASE_URL}/ai-inferences`, {
      method: 'GET',
      headers,
    });
    return response.json();
  },

  // Worker Jobs
  createWorkerJob: async (data: any) => {
    const response = await fetch(`${BASE_URL}/worker-jobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getWorkerJobs: async () => {
    const response = await fetch(`${BASE_URL}/worker-jobs`, {
      method: 'GET',
      headers,
    });
    return response.json();
  },

  updateWorkerJob: async (id: string, data: any) => {
    const response = await fetch(`${BASE_URL}/worker-jobs/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Analytics
  getAnalytics: async () => {
    const response = await fetch(`${BASE_URL}/analytics`, {
      method: 'GET',
      headers,
    });
    return response.json();
  },

  // Demo Mode
  seedDemoData: async () => {
    const response = await fetch(`${BASE_URL}/seed-demo-data`, {
      method: 'POST',
      headers,
    });
    return response.json();
  },
};