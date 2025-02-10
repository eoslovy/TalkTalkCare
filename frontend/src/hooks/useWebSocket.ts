import { useEffect, useRef } from 'react';
import { Friend, FriendStatusUpdate } from '../types/friend';

type WebSocketMessage = Friend | FriendStatusUpdate;

export const useWebSocket = (
  url: string, 
  userId: number,
  onMessage: (data: WebSocketMessage) => void
) => {
  const ws = useRef<WebSocket | null>(null);
  const isConnected = useRef(false);

  useEffect(() => {
    if (!userId || isConnected.current || ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `${url}?userId=${userId}`;
    console.log('웹소켓 연결 시도:', wsUrl);

    try {
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        console.log('웹소켓 연결 성공!');
        isConnected.current = true;
      };

      ws.current.onclose = (event) => {
        console.log('웹소켓 연결 종료:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        isConnected.current = false;
      };

      ws.current.onerror = (error) => {
        console.error('웹소켓 에러:', error);
        isConnected.current = false;
      };

      ws.current.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('메시지 파싱 에러:', error);
        }
      };
    } catch (error) {
      console.error('웹소켓 초기화 에러:', error);
      isConnected.current = false;
    }

    return () => {
      if (ws.current) {
        console.log('웹소켓 정리(cleanup) 실행');
        ws.current.close();
        isConnected.current = false;
      }
    };
  }, [url, userId, onMessage]);

  return ws.current;
};