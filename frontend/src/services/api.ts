import axios, { AxiosError, AxiosResponse } from 'axios';
import { AgentsResponse, SingleAgentResponse, AgentCreateResponse, ErrorResponse, Agent } from '../types';
import { getErrorMessage, logError } from '../utils/errorHandling';

// Create axios instance with base configuration
// Check if we're on Railway (production) by looking at the hostname
const isProduction = process.env.NODE_ENV === 'production' || 
                     window.location.hostname.includes('railway.app') ||
                     window.location.hostname.includes('up.railway.app');

const baseURL = isProduction 
  ? '/api'  // Use relative path in production (same domain)
  : 'http://localhost:3001/api';  // Use localhost in development

console.log('API Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  hostname: window.location.hostname,
  isProduction: isProduction,
  baseURL: baseURL,
  timestamp: new Date().toISOString()
});

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Error handling interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Log error with context
    logError(error, 'API Request');
    
    // Enhance error with user-friendly message
    (error as any).userMessage = getErrorMessage(error);
    
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data as ErrorResponse;
      console.error('API Error:', {
        status: error.response.status,
        message: errorData?.message || error.message,
        error: errorData?.error || 'Unknown error'
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', 'No response received from server');
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API functions with proper error handling
export const apiService = {
  /**
   * Get all agents or filter by category
   * @param category - Optional category filter
   * @returns Promise with agents data
   */
  getAgents: async (category?: string): Promise<AgentsResponse> => {
    try {
      const url = category ? `/agents?category=${encodeURIComponent(category)}` : '/agents';
      const response = await api.get<AgentsResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  },

  /**
   * Get a single agent by ID
   * @param id - Agent ID
   * @returns Promise with agent data
   */
  getAgent: async (id: string): Promise<SingleAgentResponse> => {
    try {
      const response = await api.get<SingleAgentResponse>(`/agents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching agent ${id}:`, error);
      throw error;
    }
  },

  /**
   * Upload a new agent with file
   * @param formData - FormData containing agent info and file
   * @returns Promise with created agent data
   */
  uploadAgent: async (formData: FormData): Promise<AgentCreateResponse> => {
    try {
      const response = await api.post<AgentCreateResponse>('/agents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Upload progress tracking
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading agent:', error);
      throw error;
    }
  },

  /**
   * Download an agent (increment download count)
   * @param id - Agent ID
   * @param onProgress - Optional progress callback function
   * @returns Promise with download confirmation
   */
  downloadAgent: async (id: string, onProgress?: (progress: number) => void): Promise<{ message: string }> => {
    try {
      // Simulate download progress for better UX
      if (onProgress) {
        const simulateProgress = () => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
            }
            onProgress(Math.min(progress, 100));
          }, 100);
        };
        simulateProgress();
      }

      // First, increment the download count
      const response = await api.post<{ message: string }>(`/agents/${id}/download`);
      
      // Then trigger the actual file download
      const downloadUrl = isProduction 
        ? `/api/agents/${id}/download`  // Use relative path in production
        : `http://localhost:3001/api/agents/${id}/download`;  // Use localhost in development
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = ''; // Let the browser determine the filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Ensure progress reaches 100% when complete
      if (onProgress) {
        setTimeout(() => onProgress(100), 500);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error downloading agent ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search agents by term
   * @param term - Search term
   * @returns Promise with search results
   */
  searchAgents: async (term: string): Promise<AgentsResponse> => {
    try {
      const response = await api.get<AgentsResponse>(`/agents/search/${encodeURIComponent(term)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching agents:', error);
      throw error;
    }
  },

  /**
   * Get top downloaded agents
   * @param limit - Number of agents to return (default: 10)
   * @returns Promise with top agents
   */
  getTopAgents: async (limit: number = 10): Promise<AgentsResponse> => {
    try {
      const response = await api.get<AgentsResponse>(`/agents/top/downloaded?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top agents:', error);
      throw error;
    }
  },

  /**
   * Delete an agent
   * @param id - Agent ID
   * @returns Promise with deletion confirmation
   */
  deleteAgent: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>(`/agents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting agent ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update an agent
   * @param id - Agent ID
   * @param data - Updated agent data
   * @returns Promise with updated agent data
   */
  updateAgent: async (id: string, data: Partial<Agent>): Promise<SingleAgentResponse> => {
    try {
      const response = await api.put<SingleAgentResponse>(`/agents/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating agent ${id}:`, error);
      throw error;
    }
  },

  /**
   * Health check
   * @returns Promise with health status
   */
  healthCheck: async (): Promise<{ status: string; timestamp: string; uptime: number }> => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  },
};

// Legacy API endpoints (keeping for backward compatibility)
export const agentsAPI = {
  getAll: () => api.get('/agents'),
  getByCategory: (category: string) => api.get(`/agents?category=${category}`),
  getById: (id: number) => api.get(`/agents/${id}`),
  create: (formData: FormData) => api.post('/agents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id: number, data: any) => api.put(`/agents/${id}`, data),
  delete: (id: number) => api.delete(`/agents/${id}`),
  incrementDownload: (id: number) => api.post(`/agents/${id}/download`),
  search: (term: string) => api.get(`/agents/search/${term}`),
  getTopDownloaded: (limit?: number) => api.get(`/agents/top/downloaded${limit ? `?limit=${limit}` : ''}`),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
