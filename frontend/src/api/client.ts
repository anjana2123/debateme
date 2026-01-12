import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://debateme-production-c0b0.up.railway.app/';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface DebateRequest {
  topic: string;
  user_stance: string;
  mode: string;
  max_rounds: number;
}

export interface DebateResponse {
  debate_id: string;
  ai_counter_argument: string;
  evidence: Evidence[];
  fallacies_detected: Fallacy[];
  round_number: number;
  is_debate_ended: boolean;
  ai_score: number;
  user_score: number;
  suggestions?: string;
}

export interface Evidence {
  source: string;
  url: string;
  snippet: string;
  credibility_score: number;
}

export interface Fallacy {
  type: string;
  description: string;
  explanation: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ContinueDebateRequest {
  debate_id: string;
  user_argument: string;
}

export interface UserStats {
  user_id: string;
  total_debates: number;
  debates_won: number;
  debates_lost: number;
  debates_drawn: number;
  total_rounds: number;
  fallacies_caught: number;
  evidence_cited: number;
  concessions: number;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  level: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  points: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  total_points: number;
  debates_won: number;
  level: number;
  achievements_count: number;
}

// API functions
export const debateAPI = {
  startDebate: async (request: DebateRequest): Promise<DebateResponse> => {
    const response = await api.post('/start-debate', request);
    return response.data;
  },

  continueDebate: async (request: ContinueDebateRequest): Promise<DebateResponse> => {
    const response = await api.post('/continue-debate', request);
    return response.data;
  },
};

// Gamification API
export const gamificationAPI = {
  getUserStats: async (userId: string): Promise<UserStats> => {
    const response = await api.get(`/stats/${userId}`);
    return response.data;
  },

  getLeaderboard: async (limit: number = 10): Promise<LeaderboardEntry[]> => {
    const response = await api.get(`/leaderboard?limit=${limit}`);
    return response.data;
  }
};

export default api;