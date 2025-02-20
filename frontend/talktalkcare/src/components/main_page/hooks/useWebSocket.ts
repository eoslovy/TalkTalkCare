import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = import.meta.env.VITE_API_WS_URL;

export const useWebSocket = (
  onStatusUpdate: (updatedFriend: any) => void,
  isLoggedIn: boolean
) => {
  const userIdFromStorage = localStorage.getItem("userId");
  const userId = userIdFromStorage || "";
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    // 이미 연결된 경우나 연결 시도 중인 경우 새로운 연결 시도하지 않음
    if (
      ws.current?.readyState === WebSocket.OPEN ||
      ws.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    try {
      // //console.log(`🔄 웹소켓 연결 시도 (${reconnectAttempts.current + 1}/${maxReconnectAttempts}): ${WS_URL}?userId=${userId}`);
      
      ws.current = new WebSocket(`${WS_URL}?userId=${userId}`);

      ws.current.onopen = () => {
        // //console.log("✅ 웹소켓 연결 성공!");
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.current.onclose = (event) => {
        // //console.log("❌ 웹소켓 연결 종료", event.code, event.reason);
        
        // 이전 연결 정리
        if (ws.current) {
          ws.current = null;
        }
        
        setIsConnected(false);
        
        // 의도적인 종료가 아닐 경우에만 재연결 시도
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          setTimeout(connect, 3000);
        }
      };

      ws.current.onerror = (error) => {
        // //console.error("🚫 웹소켓 에러:", error);
      };

      ws.current.onmessage = (event) => {
        // //console.log("📨 웹소켓 메시지 수신:", event.data);
        const data = JSON.parse(event.data);
        if (data.message && data.message.includes("화상통화")) {
          //console.log('화상통화 요청')
        }

        onStatusUpdate(data);
      };

    } catch (error) {
      // //console.error("🚫 웹소켓 연결 실패:", error);
      setIsConnected(false);
    }
  }, [userId, onStatusUpdate]);

  useEffect(() => {
    let connectTimeout: NodeJS.Timeout;
    let mounted = true;  // cleanup을 위한 마운트 상태 체크
    
    if (isLoggedIn && userId && !isConnected && mounted) {
      connectTimeout = setTimeout(() => {
        if (mounted) {  // 타임아웃 실행 시에도 마운트 상태 체크
          connect();
        }
      }, 2000);
    }

    return () => {
      mounted = false;
      clearTimeout(connectTimeout);
      // cleanup 시에는 웹소켓 연결만 정리하고 재연결 시도하지 않음
      if (ws.current) {
        const socket = ws.current;
        ws.current = null;  // 먼저 참조 제거
        socket.close(1000, "정상 종료");
      }
    };
  }, [isLoggedIn, userId]); // isConnected와 connect 의존성 제거

  return { isConnected };
};
