import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthApi } from '../api/apis/AuthApi';
import { createAuthConfig, createBaseConfig } from '../config';
import { UserResponse } from '../api/models';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserResponse | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      fetchCurrentUser(storedToken).catch(() => {
        // If fetch fails, logout
        logout();
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch current user data using token
  const fetchCurrentUser = async (authToken: string) => {
    try {
      console.log('Fetching current user with token:', authToken);
      
      const authConfig = createAuthConfig(authToken);
      console.log('Auth config:', authConfig);
      
      // Test the authorization by making a simple request
      await testAuthorization(authToken);
      
      const authApi = new AuthApi(authConfig);
      
      console.log('Making API request to /auth/users/me');
      const userData = await authApi.readUsersMeAuthUsersMeGet();
      console.log('User data received:', userData);
      
      setUser(userData);
      setIsLoading(false);
      return userData;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  };
  
  // Test function to check authorization
  const testAuthorization = async (token: string) => {
    try {
      console.log('Testing authorization with token', token);
      const headers = new Headers();
      headers.append('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
      
      console.log('Headers:', headers);
      
      // Make a simple fetch request to check authorization
      const response = await fetch(`${createBaseConfig().basePath}/users`, {
        method: 'GET',
        headers: headers
      });
      
      console.log('Authorization test response status:', response.status);
      
      if (!response.ok) {
        console.error('Authorization test failed with status', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      } else {
        console.log('Authorization test successful');
        const data = await response.json();
        console.log('Response data:', data);
      }
    } catch (error) {
      console.error('Error testing authorization:', error);
    }
  };

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const authApi = new AuthApi(createBaseConfig());
      const response = await authApi.loginForAccessTokenAuthTokenPost({
        username,
        password,
      });
      
      const accessToken = response.accessToken;
      console.log('Access token received:', accessToken);
      console.log('Token type:', typeof accessToken);
      
      setToken(accessToken);
      setIsAuthenticated(true);
      localStorage.setItem('token', accessToken);
      
      // Await the fetch user data to resolve the login promise only after user data is loaded
      await fetchCurrentUser(accessToken);
      return; // Successfully authenticated
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 