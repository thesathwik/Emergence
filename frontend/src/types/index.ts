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
