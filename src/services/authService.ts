import { securityService } from './securityService';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organization?: string;
  role: 'admin' | 'user' | 'viewer';
  avatar?: string;
  provider?: string;
  createdAt: Date;
  lastLogin: Date;
  isEmailVerified: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

class AuthService {
  private currentUser: User | null = null;
  private authCallbacks: ((user: User | null) => void)[] = [];

  constructor() {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    try {
      const storedUser = localStorage.getItem('ecoguard_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        // Verify the stored user is still valid
        if (this.isValidUser(userData)) {
          this.currentUser = userData;
          this.notifyAuthCallbacks();
        } else {
          this.clearStoredUser();
        }
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
      this.clearStoredUser();
    }
  }

  private isValidUser(userData: any): boolean {
    return userData && 
           userData.id && 
           userData.email && 
           userData.firstName && 
           userData.lastName;
  }

  private storeUser(user: User) {
    try {
      localStorage.setItem('ecoguard_user', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  }

  private clearStoredUser() {
    localStorage.removeItem('ecoguard_user');
  }

  private notifyAuthCallbacks() {
    this.authCallbacks.forEach(callback => callback(this.currentUser));
  }

  // Authentication Methods
  public async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication logic
      if (email === 'admin@ecoguard.pro' && password === 'password123') {
        const user: User = {
          id: '1',
          email,
          firstName: 'Admin',
          lastName: 'User',
          organization: 'EcoGuard Pro',
          role: 'admin',
          avatar: null,
          createdAt: new Date('2024-01-01'),
          lastLogin: new Date(),
          isEmailVerified: true,
          preferences: {
            theme: 'auto',
            language: 'en',
            timezone: 'UTC-8',
            notifications: {
              email: true,
              push: true,
              sms: false
            }
          }
        };

        this.currentUser = user;
        this.storeUser(user);
        this.notifyAuthCallbacks();
        
        // Log the authentication
        securityService.logAction('user_login', { email, method: 'email' });

        return { success: true, user };
      } else {
        securityService.logAction('failed_login_attempt', { email });
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      return { success: false, error: 'An error occurred during login' };
    }
  }

  public async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organization?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if user already exists (mock check)
      if (userData.email === 'admin@ecoguard.pro') {
        return { success: false, error: 'User with this email already exists' };
      }

      const user: User = {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        organization: userData.organization,
        role: 'user',
        avatar: null,
        createdAt: new Date(),
        lastLogin: new Date(),
        isEmailVerified: false,
        preferences: {
          theme: 'auto',
          language: 'en',
          timezone: 'UTC-8',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      };

      // Log the registration
      securityService.logAction('user_registration', { 
        email: userData.email, 
        method: 'email' 
      });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'An error occurred during registration' };
    }
  }

  public async socialLogin(provider: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Simulate social login API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const user: User = {
        id: Date.now().toString(),
        email: `user@${provider}.com`,
        firstName: 'Social',
        lastName: 'User',
        organization: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        role: 'user',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
        provider,
        createdAt: new Date(),
        lastLogin: new Date(),
        isEmailVerified: true,
        preferences: {
          theme: 'auto',
          language: 'en',
          timezone: 'UTC-8',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      };

      this.currentUser = user;
      this.storeUser(user);
      this.notifyAuthCallbacks();

      // Log the social login
      securityService.logAction('social_login', { 
        email: user.email, 
        provider,
        method: 'social' 
      });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: `Failed to login with ${provider}` };
    }
  }

  public async logout(): Promise<void> {
    if (this.currentUser) {
      securityService.logAction('user_logout', { 
        email: this.currentUser.email 
      });
    }

    this.currentUser = null;
    this.clearStoredUser();
    this.notifyAuthCallbacks();
  }

  public async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      securityService.logAction('password_reset_requested', { email });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to send password reset email' };
    }
  }

  public async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      securityService.logAction('password_reset_completed', { token });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to reset password' };
    }
  }

  public async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedUser = { ...this.currentUser, ...updates };
      this.currentUser = updatedUser;
      this.storeUser(updatedUser);
      this.notifyAuthCallbacks();

      securityService.logAction('profile_updated', { 
        email: this.currentUser.email,
        updatedFields: Object.keys(updates)
      });

      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      securityService.logAction('password_changed', { 
        email: this.currentUser.email 
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to change password' };
    }
  }

  public async verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (this.currentUser) {
        this.currentUser.isEmailVerified = true;
        this.storeUser(this.currentUser);
        this.notifyAuthCallbacks();
      }

      securityService.logAction('email_verified', { token });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to verify email' };
    }
  }

  // Utility Methods
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  public hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;

    // Define role-based permissions
    const permissions = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_system'],
      user: ['read', 'write'],
      viewer: ['read']
    };

    return permissions[this.currentUser.role]?.includes(permission) || false;
  }

  public onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authCallbacks.indexOf(callback);
      if (index > -1) {
        this.authCallbacks.splice(index, 1);
      }
    };
  }

  public async refreshToken(): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate token refresh
      await new Promise(resolve => setTimeout(resolve, 500));

      if (this.currentUser) {
        this.currentUser.lastLogin = new Date();
        this.storeUser(this.currentUser);
        this.notifyAuthCallbacks();
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to refresh token' };
    }
  }

  public getAuthHeaders(): { [key: string]: string } {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    if (this.currentUser) {
      headers['Authorization'] = `Bearer ${this.generateMockToken()}`;
    }

    return headers;
  }

  private generateMockToken(): string {
    // Generate a mock JWT token for demonstration
    return btoa(JSON.stringify({
      userId: this.currentUser?.id,
      email: this.currentUser?.email,
      role: this.currentUser?.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));
  }
}

export const authService = new AuthService();