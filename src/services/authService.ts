import { ADMIN_CONFIG } from '../config/constants';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
    role: string;
  } | null;
}

class AuthService {
  private authState: AuthState = {
    isAuthenticated: false,
    user: null
  };

  private listeners: Array<(state: AuthState) => void> = [];

  constructor() {
    this.loadAuthState();
  }

  private loadAuthState(): void {
    try {
      const stored = localStorage.getItem('fechannel_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.authState = parsed;
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    }
  }

  private saveAuthState(): void {
    try {
      localStorage.setItem('fechannel_auth', JSON.stringify(this.authState));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    // Simple authentication for immediate deployment
    // This can be easily upgraded to Supabase auth later
    if (email === ADMIN_CONFIG.adminEmail && password === ADMIN_CONFIG.adminPassword) {
      this.authState = {
        isAuthenticated: true,
        user: {
          email: email,
          role: 'admin'
        }
      };
      this.saveAuthState();
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  }

  async logout(): Promise<void> {
    this.authState = {
      isAuthenticated: false,
      user: null
    };
    this.saveAuthState();
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  isAdmin(): boolean {
    return this.authState.isAuthenticated && this.authState.user?.role === 'admin';
  }

  onAuthStateChange(callback: (state: AuthState) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// Export singleton instance
export const authService = new AuthService();