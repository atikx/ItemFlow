import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT, // Set your API base URL
  withCredentials: true, // Set to true to send cookies when making a request,
});

export default api;