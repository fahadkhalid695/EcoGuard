// API Service for EcoGuard Pro Backend Integration
class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
    this.token = localStorage.getItem('ecoguard_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.tokens?.accessToken) {
      this.token = response.tokens.accessToken;
      localStorage.setItem('ecoguard_token', this.token);
    }
    
    return response;
  }

  async register(userData: any) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.token = null;
      localStorage.removeItem('ecoguard_token');
    }
  }

  // Sensors
  async getSensors(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<any>(`/sensors${query}`);
  }

  async createSensor(sensorData: any) {
    return this.request<any>('/sensors', {
      method: 'POST',
      body: JSON.stringify(sensorData),
    });
  }

  async updateSensor(id: string, updates: any) {
    return this.request<any>(`/sensors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteSensor(id: string) {
    return this.request<any>(`/sensors/${id}`, {
      method: 'DELETE',
    });
  }

  // Readings
  async getSensorReadings(sensorId: string, params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<any>(`/readings/sensor/${sensorId}${query}`);
  }

  async addReading(sensorId: string, reading: any) {
    return this.request<any>(`/readings/sensor/${sensorId}`, {
      method: 'POST',
      body: JSON.stringify(reading),
    });
  }

  async addBatchReadings(readings: any[]) {
    return this.request<any>('/readings/batch', {
      method: 'POST',
      body: JSON.stringify({ readings }),
    });
  }

  // Alerts
  async getAlerts(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<any>(`/alerts${query}`);
  }

  async acknowledgeAlert(id: string) {
    return this.request<any>(`/alerts/${id}/acknowledge`, {
      method: 'PUT',
    });
  }

  // Analytics
  async getAnalyticsOverview() {
    return this.request<any>('/analytics/overview');
  }

  async getSensorPerformance(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<any>(`/analytics/sensors/performance${query}`);
  }

  async getTrends(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<any>(`/analytics/trends${query}`);
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('ecoguard_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('ecoguard_token');
  }
}

export const apiService = new ApiService();