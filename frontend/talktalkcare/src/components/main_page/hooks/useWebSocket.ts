import { useEffect, useRef } from "react";
import { Friend } from "../friends";

const WS_URL = "ws://localhost:8080/api/talktalkcare";

export const useWebSocket = (onStatusUpdate: (updatedFriend: Friend) => void) => {
  const userIdFromStorage = localStorage.getItem("userId");
  // null 체크 후 할당
  const userId = userIdFromStorage || "";
  const ws = useRef<WebSocket | null>(null);
  const isConnected = useRef(false);
  
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = () => {
    // 빈 문자열이거나 재연결 시도 초과 시 연결하지 않음
    if (!userId || reconnectAttempts.current >= maxReconnectAttempts) {
      return;
    }

    const wsConnection = `${WS_URL}/?userId=${userId}`;
    console.log(`🔄 WebSocket 연결 시도 (${reconnectAttempts.current + 1}/${maxReconnectAttempts}):`, wsConnection);

    ws.current = new WebSocket(wsConnection);

    ws.current.onopen = () => {
      console.log("✅ WebSocket 연결 성공!");
      isConnected.current = true;
      reconnectAttempts.current = 0;

      const loginMessage = {
        userId: parseInt(userId), // 여기서 userId는 항상 string
        status: "ONLINE",
        lastActiveTime: new Date().toISOString(),
      };
      ws.current?.send(JSON.stringify(loginMessage));
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

      // 재연결 시도
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