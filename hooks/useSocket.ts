// hooks/useSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

// Your server runs on port 8008
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:8008";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { isAuthenticated, accessToken } = useAuth();

  useEffect(() => {
    console.log("[Socket] Auth state:", { isAuthenticated, hasToken: !!accessToken });

    if (!isAuthenticated || !accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Build the URL with token in query string (like your other project)
    const socketUrl = `${SOCKET_URL}?token=${accessToken}`;
    console.log("[Socket] Connecting to:", socketUrl);

    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"], // Fallback to polling if websocket fails
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("[Socket] ✅ Connected:", newSocket.id);
      setConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[Socket] ❌ Disconnected, reason:", reason);
      setConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Socket] ❌ Connection error:", error.message);
      setConnected(false);
    });

    // Listen for authentication errors from server
    newSocket.on("error", (error) => {
      console.error("[Socket] Server error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [isAuthenticated, accessToken]);

  return { socket, connected };
}