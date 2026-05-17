import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// ─── Auth token helpers ───────────────────
export const setToken = (token) => localStorage.setItem("ict_token", token);

export const getToken = () => localStorage.getItem("ict_token");

export const clearToken = () => localStorage.removeItem("ict_token");

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
