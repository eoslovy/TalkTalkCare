import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Friend } from '../components/main_page/friends';
import CustomModal from '../components/CustomModal';
import CallNotificationModal from '../components/CallNotificationModal';
import openviduService from '../services/openviduService';

const WS_URL = import.meta.env.VITE_API_WS_URL;
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface GameEvent {
  eventType: 'GAME_SELECTED' | 'GAME_DESELECTED' | 'SKILL_CHANGED';
  gameId?: string;
  skill?: string;
  senderId?: string;
}

export interface CallInvitationDto {
  callerId: number;
  callerName: string;
  receiverId: number;
  receiverName: string;
  message: string;
  openviduSessionId: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  setIsLoggedIn: (value: boolean) => void;
  onFriendStatusUpdate: (callback: (friends: Friend[]) => void) => void;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  sendGameEvent: (data: GameEvent) => void;
  onGameSelected: (callback: (event: GameEvent) => void) => void;
  wsModalOpen: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [modalSource, setModalSource] = useState<"ws" | "local" | null>(null);
  const friendStatusCallbackRef = useRef<((friends: Friend[]) => void) | undefined>();
  const gameSelectionCallback = useRef<(event: GameEvent) => void>();
  const [callInvitation, setCallInvitation] = useState<CallInvitationDto | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!userId);
  }, []);

  

  useEffect(() => {
    if (!isLoggedIn) return;
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const connectWebSocket = () => {
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.log('최대 재연결 시도 횟수 도달');
        return;
      }
      try {
        const websocket = new WebSocket(`${WS_URL}?userId=${userId}`);
        websocket.onopen = () => {
          console.log('✅ WebSocket 연결됨');
          setIsConnected(true);
          reconnectAttempts.current = 0;
        };
        websocket.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("WebSocket 메시지 수신:", data);

            // 화상통화 요청 처리
            if (data.message && data.message.includes("화상통화")) {
              setCallInvitation(data);
            }
            // receiver가 화상통화를 수락했다는 것을 caller에게 알림
            if (data.message && data.message.includes("수락하였습니다")) {
              const acceptedData = data as CallInvitationDto;
              localStorage.setItem('opponentUserId', acceptedData.receiverId.toString());
              await openviduService.joinSession(acceptedData.openviduSessionId); //caller 접속
              localStorage.setItem('currentSessionId', acceptedData.openviduSessionId);
              navigate('/videocall');
            }
            // 화상통화 거절 시 처리
            if (data.message && data.message.includes("거절하였습니다")) {
              const acceptedData = data as CallInvitationDto;
              localStorage.removeItem('currentSessionId');
              localStorage.removeItem('opponentUserId');
              setModalMessage(`${acceptedData.receiverName}님께서 화상통화 요청을 거절하셨습니다.`);
              setModalSource("ws");  // WS 출처 지정
              setIsModalOpen(true);
              
            }

            // 친구 상태 업데이트 (옵션)
            if (friendStatusCallbackRef.current && Array.isArray(data)) {
              friendStatusCallbackRef.current(data);
            }
            // 게임 이벤트 수신 처리
            if (data.eventType) {
              console.log("게임 이벤트 수신:", data);
              if (gameSelectionCallback.current) {
                gameSelectionCallback.current(data);
              }
            }
          } catch (error) {
            console.error('WebSocket 메시지 처리 오류:', error);
          }
        };
        websocket.onclose = (event) => {
          console.log('❌ WebSocket 연결 종료');
          setIsConnected(false);
          setWs(null);
          if (event.code !== 1000) {
            reconnectAttempts.current += 1;
            if (reconnectAttempts.current < maxReconnectAttempts) {
              console.log(`재연결 시도 ${reconnectAttempts.current}/${maxReconnectAttempts}`);
              setTimeout(connectWebSocket, 3000);
            }
          }
        };
        setWs(websocket);
      } catch (error) {
        console.error('웹소켓 연결 중 오류:', error);
        reconnectAttempts.current += 1;
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close(1000, "정상 종료");
      }
    };
  }, [isLoggedIn, navigate]);

  const handleAcceptCall = async () => {
    if (callInvitation) {
      console.log('화상통화 수락:', callInvitation);
      try {
        // receiver
        await openviduService.joinSession(callInvitation.openviduSessionId);
        localStorage.setItem('currentSessionId', callInvitation.openviduSessionId);
        localStorage.setItem('opponentUserId',callInvitation.callerId.toString());

        // 백엔드로 /call/accept 요청 전송하여 caller에게 수락 메시지 전송
        await fetch(`${BASE_URL}/call/accept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receiverId: callInvitation.receiverId,
            callerId: callInvitation.callerId,
            openviduSessionId: callInvitation.openviduSessionId,
          }),
          credentials: 'include',
        });

        navigate('/videocall');

      } catch (error) {
        console.error('Receiver 세션 접속 실패:', error);
      }
      setCallInvitation(null);
    }
  };

   // 거절 버튼 클릭 시, /call/reject 요청을 보내 caller에게 알림
   const handleRejectCall = async () => {
    if (callInvitation) {
      console.log('화상통화 거절:', callInvitation);
      try {
        await fetch(`${BASE_URL}/call/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receiverName: callInvitation.receiverName,
            callerId: callInvitation.callerId,
            openviduSessionId: callInvitation.openviduSessionId,
          }),
          credentials: 'include',
        });
      } catch (error) {
        console.error('call/reject 요청 중 에러:', error);
      }
      setCallInvitation(null);
    }
  };


  // 웹소켓으로 게임 이벤트 전송 (바로 ws.send 사용)
  const sendGameEvent = (data: GameEvent) => {
    if (ws && isConnected) {
      const userId = localStorage.getItem('userId');
      const enrichedData = { ...data, senderId: userId };
      console.log('📤 WebSocket 이벤트 전송:', enrichedData);
      ws.send(JSON.stringify(enrichedData));
    } else {
      console.log('⚠️ WebSocket 연결 안됨: 이벤트 전송 실패');
    }
  };

  // onGameSelected 콜백 등록
  const onGameSelected = useCallback((callback: (event: GameEvent) => void) => {
    console.log('🟢 onGameSelected() 실행됨, 콜백 등록:', callback);
    gameSelectionCallback.current = callback;
  }, []);

  const contextValue: WebSocketContextType = {
    isConnected,
    setIsLoggedIn,
    onFriendStatusUpdate: useCallback((callback?: (friends: Friend[]) => void) => {
      friendStatusCallbackRef.current = callback;
    }, []),
    acceptCall: handleAcceptCall,
    rejectCall: handleRejectCall,
    sendGameEvent,
    onGameSelected,
    wsModalOpen: isModalOpen,
    modalSource,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
      {callInvitation && (
        <CallNotificationModal
          title="화상통화 요청"
          message={`${callInvitation.callerName}님께서 ${callInvitation.receiverName}에게 화상통화 요청을 보냈습니다. 수락하시겠습니까?`}
          isOpen={true}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
  
      {/* 모달 상태에 따른 CustomModal 렌더링 */}
      {isModalOpen && (
        <CustomModal
          title="알림"
          message={modalMessage}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setModalSource(null);
          }}
          
        />
      )}
    </WebSocketContext.Provider>
  );
  
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
