import axios from "axios";

export const uptimeServer = () => {
  const request = axios.get(import.meta.env.VITE_API_BASE_URL);
  return request;
};
