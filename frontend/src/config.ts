import { Configuration } from './api/runtime';

// API configuration
export const API_CONFIG = {
  basePath: import.meta.env.VITE_API_URL || 'http://localhost:8000',
};

// Create configuration with optional auth token
export const createConfig = (token?: string | null): Configuration => {
  const options: {
    basePath: string;
    accessToken?: string;
  } = {
    basePath: API_CONFIG.basePath,
  };
  
  // Add token if provided
  if (token) {
    options.accessToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  
  return new Configuration(options);
};

// Legacy exports for backward compatibility
export const createBaseConfig = (): Configuration => createConfig();
export const createAuthConfig = (token: string): Configuration => createConfig(token); 