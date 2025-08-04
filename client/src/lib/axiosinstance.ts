import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // Set your API base URL
  withCredentials: true, // Set to true to send cookies when making a request,
});

export default api;