import axios from 'axios';

const setupAxiosInterceptors = () => {
  // This interceptor runs before every request is sent.
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      const isApiRoute = config.url.startsWith('/api');

      if (isApiRoute && !token) {
        // CRITICAL FIX: If it's a protected API route and no token exists, 
        // cancel the request locally on the frontend.
        const error = new Error('Request cancelled: No authentication token found.');
        error.code = 'ERR_CANCELED_AUTH';
        return Promise.reject(error);
      }

      if (token) {
        // Ensure the token is always in the header if it exists
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;