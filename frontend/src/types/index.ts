// Agent interface
export interface Agent {
  id: number;
  name: string;
  description: string;
  category: string;
  author_name: string;
  file_path: string;
  file_size: number;
  download_count: number;
  created_at: string;
  user_id?: number | null; // ID of the user who uploaded the agent
}

// API response interfaces
export interface AgentsResponse {
  agents: Agent[];
  count: number;
  message: string;
  filtered: boolean;
}

export interface SingleAgentResponse {
  message: string;
  agent: Agent;
}

export interface AgentCreateResponse {
  message: string;
  agent: Agent;
  file: {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  id?: number;
  missingFields?: string[];
}

// Form data interface for creating agents
export interface AgentFormData {
  name: string;
  description: string;
  category: string;
  author_name: string;
  file: File | null;
}

// Authentication interfaces
export interface User {
  id: number;
  name: string;
  email: string;
  isVerified: boolean;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
  emailSent?: boolean;
  verificationUrl?: string;
}

export interface AuthError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
