const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  baseUrl: process.env.REACT_APP_BASE_URL || 'http://localhost:3000',
  environment: process.env.REACT_APP_ENV || 'development'
};

export default config;
