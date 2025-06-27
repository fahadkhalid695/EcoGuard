import CryptoJS from 'crypto-js';

class SecurityService {
  private encryptionKey: string;
  private sessionToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.encryptionKey = this.generateEncryptionKey();
    this.initializeSession();
  }

  private generateEncryptionKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  private initializeSession() {
    // Check for existing session
    const storedToken = localStorage.getItem('ecoguard_session');
    if (storedToken) {
      try {
        const decrypted = this.decrypt(storedToken);
        const session = JSON.parse(decrypted);
        if (session.expiresAt > Date.now()) {
          this.sessionToken = session.token;
          this.refreshToken = session.refreshToken;
        } else {
          this.clearSession();
        }
      } catch (error) {
        this.clearSession();
      }
    }
  }

  // Encryption/Decryption
  public encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  public decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Authentication
  public async authenticate(username: string, password: string): Promise<boolean> {
    try {
      // Simulate API call
      const response = await this.mockAuthAPI(username, password);
      
      if (response.success) {
        this.sessionToken = response.token;
        this.refreshToken = response.refreshToken;
        
        // Store encrypted session
        const sessionData = {
          token: this.sessionToken,
          refreshToken: this.refreshToken,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        
        const encryptedSession = this.encrypt(JSON.stringify(sessionData));
        localStorage.setItem('ecoguard_session', encryptedSession);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  private async mockAuthAPI(username: string, password: string): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in production, this would be a real API call
    if (username === 'admin' && password === 'password') {
      return {
        success: true,
        token: this.generateToken(),
        refreshToken: this.generateToken()
      };
    }
    
    return { success: false };
  }

  private generateToken(): string {
    return CryptoJS.lib.WordArray.random(128/8).toString();
  }

  public isAuthenticated(): boolean {
    return this.sessionToken !== null;
  }

  public getAuthToken(): string | null {
    return this.sessionToken;
  }

  public async refreshSession(): Promise<boolean> {
    if (!this.refreshToken) return false;
    
    try {
      // Simulate refresh API call
      const response = await this.mockRefreshAPI(this.refreshToken);
      
      if (response.success) {
        this.sessionToken = response.token;
        return true;
      }
      
      this.clearSession();
      return false;
    } catch (error) {
      this.clearSession();
      return false;
    }
  }

  private async mockRefreshAPI(refreshToken: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock refresh - in production, validate refresh token
    return {
      success: true,
      token: this.generateToken()
    };
  }

  public logout(): void {
    this.clearSession();
  }

  private clearSession(): void {
    this.sessionToken = null;
    this.refreshToken = null;
    localStorage.removeItem('ecoguard_session');
  }

  // Data Validation
  public validateSensorData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    
    const requiredFields = ['sensorId', 'timestamp', 'value', 'unit'];
    return requiredFields.every(field => field in data);
  }

  public sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .trim();
  }

  // API Security
  public generateAPIKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  public validateAPIKey(apiKey: string): boolean {
    // In production, this would validate against stored API keys
    return apiKey.length === 64; // Basic validation
  }

  public createSecureHeaders(): { [key: string]: string } {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
    
    if (this.sessionToken) {
      headers['Authorization'] = `Bearer ${this.sessionToken}`;
    }
    
    return headers;
  }

  // Rate Limiting
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();

  public checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.requestCounts.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }

  // Audit Logging
  private auditLogs: Array<{
    timestamp: Date;
    action: string;
    user: string;
    details: any;
  }> = [];

  public logAction(action: string, details: any = {}): void {
    this.auditLogs.push({
      timestamp: new Date(),
      action,
      user: this.sessionToken ? 'authenticated_user' : 'anonymous',
      details
    });
    
    // Keep only last 1000 logs
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }
  }

  public getAuditLogs(limit: number = 50): any[] {
    return this.auditLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Data Privacy
  public anonymizeData(data: any): any {
    const anonymized = { ...data };
    
    // Remove or hash sensitive fields
    if (anonymized.location) {
      // Reduce location precision
      anonymized.location = {
        ...anonymized.location,
        lat: Math.round(anonymized.location.lat * 100) / 100,
        lng: Math.round(anonymized.location.lng * 100) / 100
      };
    }
    
    // Remove user identifiers
    delete anonymized.userId;
    delete anonymized.deviceId;
    
    return anonymized;
  }

  // Security Monitoring
  public detectSuspiciousActivity(data: any): boolean {
    // Check for unusual patterns
    if (data.value && (data.value < 0 || data.value > 10000)) {
      this.logAction('suspicious_sensor_value', { value: data.value });
      return true;
    }
    
    // Check for rapid requests
    if (!this.checkRateLimit(data.sensorId || 'unknown', 10, 60000)) {
      this.logAction('rate_limit_exceeded', { sensorId: data.sensorId });
      return true;
    }
    
    return false;
  }

  public getSecurityStatus(): any {
    return {
      authenticated: this.isAuthenticated(),
      sessionValid: this.sessionToken !== null,
      auditLogCount: this.auditLogs.length,
      rateLimitActive: this.requestCounts.size > 0,
      encryptionEnabled: true
    };
  }
}

export const securityService = new SecurityService();