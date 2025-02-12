import { useEffect, useRef } from "react";
import { Friend } from "../friends";

const WS_URL = import.meta.env.VITE_API_WS_URL;

export const useWebSocket = (onStatusUpdate: (updatedFriend: Friend) => void) => {
  const userIdFromStorage = localStorage.getItem("userId");
  const userId = userIdFromStorage || "";
  const ws = useRef<WebSocket | null>(null);
  const isConnected = useRef(false);
  
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = () => {
    if (!userId || reconnectAttempts.current >= maxReconnectAttempts) {
      return;
    }
// 확인 필요요
    const wsConnection = `${WS_URL}/?userId=${userId}`;
    console.log(`🔄 WebSocket 연결 시도 (${reconnectAttempts.current + 1}/${maxReconnectAttempts}):`, wsConnection);

    ws.current = new WebSocket(wsConnection);

    ws.current.onopen = () => {
      console.log("✅ WebSocket 연결 성공!");
      isConnected.current = true;
      reconnectAttempts.current = 0;

      const loginMessage = {
        userId: parseInt(userId),
        status: "ONLINE",
        lastActiveTime: new Date().toISOString(),
      };
      ws.current?.send(JSON.stringify(loginMessage));
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 WebSocket 메시지 수신:", data);
        onStatusUpdate(data);
      } catch (error) {
        console.error("⚠️ 메시지 파싱 에러:", error);
      }
    };

    ws.current.onerror = (error) => {
      console.log("❌ WebSocket 연결 실패");
      console.error("⚠️ WebSocket 에러 발생:", error);
      isConnected.current = false;
    };

    ws.current.onclose = (event) => {
      console.log("🔴 WebSocket 연결 종료:", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
      isConnected.current = false;

      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        setTimeout(connect, reconnectDelay);
      }
    };
  };

  useEffect(() => {
    connect();

    const handleBeforeUnload = () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        const logoutMessage = {
          userId: parseInt(userId),
          status: "OFFLINE",
          lastActiveTime: new Date().toISOString(),
        };
        ws.current.send(JSON.stringify(logoutMessage));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (ws.current?.readyState === WebSocket.OPEN) {
        const logoutMessage = {
          userId: parseInt(userId),
          status: "OFFLINE",
          lastActiveTime: new Date().toISOString(),
        };
        ws.current.send(JSON.stringify(logoutMessage));
        ws.current.close();
      }
      isConnected.current = false;
    };
  }, [userId]);

  return {
    isConnected: isConnected.current,
    connectionState: ws.current?.readyState,
  };
};
