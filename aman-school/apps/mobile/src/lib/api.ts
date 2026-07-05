import { createApiClient, createSocket } from "@aman-school/api-client";
import { API_BASE_URL, SOCKET_URL } from "./config";
import { useSessionStore } from "../store/session";

export const api = createApiClient({
  baseUrl: API_BASE_URL,
  getAccessToken: () => useSessionStore.getState().accessToken,
  onUnauthorized: () => {
    useSessionStore.getState().clear();
  },
});

export function connectSocket() {
  const token = useSessionStore.getState().accessToken;
  if (!token) return null;
  return createSocket(SOCKET_URL, token);
}
