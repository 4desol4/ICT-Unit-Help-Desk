import axios from "axios";

// Production: use full backend URL; Dev: use proxy
const baseURL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "/api" // Use Vite proxy in dev
    : "https://ict-unit-help-desk.onrender.com/api"; // Use full URL in production

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Auth token helpers ───────────────────
export const setToken = (token) => {
  if (token) {
    localStorage.setItem("ict_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

export const getToken = () => localStorage.getItem("ict_token");

export const clearToken = () => {
  localStorage.removeItem("ict_token");
  delete api.defaults.headers.common["Authorization"];
};

// Initialize token if it exists in localStorage
const existingToken = getToken();
if (existingToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${existingToken}`;
}

// Attach token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = "/user/login";
    }
    return Promise.reject(error);
  },
);

// ─── Tickets ──────────────────────────────
export const submitTicket = (data) => api.post("/tickets", data);
export const getTickets = (filters) => api.get("/tickets", { params: filters });
export const getMyTickets = () => api.get("/tickets/user/my");
export const getTicket = (id) => api.get(`/tickets/${id}`);
export const updateTicket = (id, data) => api.patch(`/tickets/${id}`, data);
export const deleteTicket = (id) => api.delete(`/tickets/${id}`);
export const getStats = () => api.get("/tickets/stats");

// ─── Messages ─────────────────────────────
export const getMessages = (ticketId) => api.get(`/messages/${ticketId}`);

export const sendUserMessage = (ticketId, data) =>
  api.post(`/messages/${ticketId}/user`, data);

export const sendAgentMessage = (ticketId, data) =>
  api.post(`/messages/${ticketId}/agent`, data);

// ─── Auth ─────────────────────────────────
export const adminLogin = (data) => api.post("/auth/admin/login", data);
export const agentLogin = (data) => api.post("/auth/agent/login", data);
export const userLogin = (data) => api.post("/auth/user/login", data);

// ─── Agents ───────────────────────────────
export const getAgents = () => api.get("/agents");
export const createAgent = (data) => api.post("/agents", data);
export const updateAgent = (id, data) => api.patch(`/agents/${id}`, data);
export const deleteAgent = (id) => api.delete(`/agents/${id}`);
export const getAgentStats = (id) => api.get(`/agents/${id}/stats`);

// ─── Images ───────────────────────────────
export const uploadImage = (imageDataURI, ticketId) =>
  api.post("/images/upload", {
    image: imageDataURI,
    ticketId,
  });
