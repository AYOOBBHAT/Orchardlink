import axios from 'axios';

/**
 * Full API base URL including `/api` path.
 * Local: http://localhost:5000/api
 * Production: https://your-service.up.railway.app/api
 */
const baseURL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
)
  .trim()
  .replace(/\/$/, '');

const api = axios.create({
  baseURL,
});

export default api;
