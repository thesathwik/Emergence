import axios from 'axios';

// Create axios instance for user API calls
const userApi = axios.create({
  baseURL: 'http://localhost:3001/api/user',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
userApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', `${config.baseURL || ''}${config.url || ''}`);
    console.log('With headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('User API Error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return Promise.reject(error);
  }
);

export interface ApiKey {
  id: number;
  api_key: string;
  key_name: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export interface ApiKeyResponse {
  api_keys: ApiKey[];
}

export interface GeneratedApiKeyResponse {
  message: string;
  api_key_details: {
    id: number;
    api_key: string;
    key_name: string;
    expires_at: string | null;
    created_at: string;
    instance_name: string;
  };
}

export const userService = {
  // Get user's API keys
  getApiKeys: async (): Promise<ApiKeyResponse> => {
    try {
      const response = await userApi.get<ApiKeyResponse>('/api-keys');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      throw error;
    }
  },

  // Generate new API key
  generateApiKey: async (keyName: string): Promise<GeneratedApiKeyResponse> => {
    try {
      const response = await userApi.post<GeneratedApiKeyResponse>('/api-keys', {
        key_name: keyName || 'Default Key'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate API key:', error);
      throw error;
    }
  },

  // Revoke API key
  revokeApiKey: async (keyId: number): Promise<{ message: string }> => {
    try {
      const response = await userApi.delete<{ message: string }>(`/api-keys/${keyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      throw error;
    }
  }
};

export default userService;