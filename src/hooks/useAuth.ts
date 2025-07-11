import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
    role: string;
  } | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((newState) => {
      setAuthState(newState);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setLoading(false);
    }
  };

  return {
    ...authState,
    loading,
    login,
    logout,
    isAdmin: authService.isAdmin()
  };
}