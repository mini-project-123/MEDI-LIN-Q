// import axios from 'axios';

// const setupAxiosInterceptors = () => {
//   // This interceptor runs before every request is sent.
//   axios.interceptors.request.use(
//     (config) => {
//       const token = localStorage.getItem('accessToken');
//       const isApiRoute = config.url.startsWith('/api');

//       // --- THIS IS THE FIX ---
//       // We must allow the register and login routes to pass through
//       // even if there is no token.
//       const isAuthRoute = config.url.startsWith('/api/register') || config.url.startsWith('/api/login');
      
//       if (isApiRoute && !isAuthRoute && !token) {
//         // If it's any other API route, AND there is no token,
//         // then we can cancel the request.
//         const error = new Error('Request cancelled: No authentication token found.');
//         error.code = 'ERR_CANCELED_AUTH';
//         return Promise.reject(error);
//       }
//       // --- END OF FIX ---

//       if (token) {
//         // Ensure the token is always in the header if it exists
//         config.headers.Authorization = `Bearer ${token}`;
//       }
      
//       return config;
//     },
//     (error) => {
//       return Promise.reject(error);
//     }
//   );
// };

// export default setupAxiosInterceptors;


// This file's logic is being moved to AuthContext to prevent conflicts.
const setupAxiosInterceptors = () => {
  // Do nothing.
};

export default setupAxiosInterceptors;