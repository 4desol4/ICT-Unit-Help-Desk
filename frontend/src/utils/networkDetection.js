/**
 * Network Detection Utility
 * Automatically detects if user is on local network or internet
 * and points to appropriate backend
 */

// Detect if user is on local network
export function isLocalNetwork() {
  const host = window.location.hostname;

  return (
    host === "ict.local" ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("192.168.") ||
    host.startsWith("10.0.") ||
    host.startsWith("172.") ||
    host.endsWith(".local")
  );
}

// Get appropriate API base URL
export function getApiUrl() {
  if (isLocalNetwork()) {
    const baseUrl = `http://${window.location.hostname}:5000`;
    console.log("[Network Detection] 🏠 LOCAL MODE - API URL:", baseUrl);
    return baseUrl;
  }

  const onlineUrl =
    import.meta.env.VITE_API_BASE ||
    "https://ict-unit-help-desk.onrender.com/api";
  console.log("[Network Detection] 🌐 ONLINE MODE - API URL:", onlineUrl);
  return onlineUrl;
}

// Get appropriate Socket.io URL
export function getSocketUrl() {
  if (isLocalNetwork()) {
    const baseUrl = `http://${window.location.hostname}:5000`;
    console.log("[Network Detection] 🏠 LOCAL MODE - Socket URL:", baseUrl);
    return baseUrl;
  }

  const onlineUrl =
    import.meta.env.VITE_SOCKET_URL ||
    "https://ict-unit-help-desk.onrender.com";
  console.log("[Network Detection] 🌐 ONLINE MODE - Socket URL:", onlineUrl);
  return onlineUrl;
}

// Get network mode info
export function getNetworkMode() {
  return {
    isLocal: isLocalNetwork(),
    hostname: window.location.hostname,
    apiUrl: getApiUrl(),
    socketUrl: getSocketUrl(),
  };
}

// Display network status in console
export function logNetworkStatus() {
  const mode = getNetworkMode();
  console.log("[Network Detection] Status:", {
    mode: mode.isLocal ? "🏠 LOCAL" : "🌐 ONLINE",
    hostname: mode.hostname,
    apiUrl: mode.apiUrl,
    socketUrl: mode.socketUrl,
  });
}
