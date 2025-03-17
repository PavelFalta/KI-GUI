import { Configuration } from './api/runtime';

// Base API URL - change this based on your environment
export const BASE_PATH = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Default configuration without authentication
export const createBaseConfig = (): Configuration => {
  return new Configuration({
    basePath: BASE_PATH,
  });
};

// Configuration with auth token
export const createAuthConfig = (token: string): Configuration => {
  // Format the token as a bearer token if it doesn't already have the prefix
  const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  
  return new Configuration({
    basePath: BASE_PATH,
    accessToken: formattedToken,
  });
}; 