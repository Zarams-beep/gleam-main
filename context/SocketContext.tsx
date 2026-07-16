"use client";
// Socket.io connection lives here, scoped to the dashboard (see
// app/dashboard/layout.tsx), so it's created once per session and shared by
// the messaging UI, typing indicators, and call signaling instead of every
// component opening its own connection.
//
// The browser connects DIRECTLY to the Express backend (not through the
// Next.js /api/proxy BFF — that route can't upgrade a request to a
// WebSocket). Auth uses a short-lived "socket ticket" instead of the real
// accessToken, which never leaves the Next.js server. socket.io-client calls
// the `auth` function fresh on every (re)connect attempt, so a new ticket is
// minted each time without us having to manage refresh timers ourselves.
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { authApi } from "@/utils/api";
import { useAppSelector } from "@/store/hooks";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type SocketContextValue = {
  socket: Socket | null;
  connected: boolean;
};

const SocketContext = createContext<SocketContextValue>({ socket: null, connected: false });

export function SocketProvider({ children }: { children: ReactNode }) {
  const userId = useAppSelector((s) => s.user.user?.id);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) {
      setSocket(null);
      setConnected(false);
      return;
    }

    const s = io(BACKEND, {
      withCredentials: true,
      auth: (cb) => {
        authApi
          .socketTicket()
          .then((r: any) => cb({ ticket: r?.ticket }))
          .catch(() => cb({}));
      },
    });

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    s.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setConnected(false);
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
