import React, { useEffect, useState, useRef } from 'react';
import { Session, Publisher, Subscriber, StreamManager } from 'openvidu-browser';
import openviduService from '../../services/openviduService';
import { useNavigate } from 'react-router-dom';
import WsGameListPage from '../../pages/GamePages/ws/WsGameListPage';
import '../../styles/components/VideoCall.css';

interface StreamReconnectData {
  streamId: string;
  userId: string | null;
}

const VideoCall: React.FC = () => {
  const navigate = useNavigate();

  const sessionRef = useRef<Session | null>(null);
  const publisherRef = useRef<Publisher | null>(null);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);

  const sessionId = localStorage.getItem('currentSessionId') || 'default-session';

  const MAX_RETRY_COUNT = 3;
  const RETRY_DELAY = 2000;
  
  const retryCountRef = useRef<number>(0);
  const [connectionState, setConnectionState] = useState<string>('');
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  const handleStreamCreated = async (event: any) => {
    if (!sessionRef.current) return;
    
    console.log('새 스트림 생성됨:', event.stream.streamId);
    
    try {
      // 기존 동일 ID 스트림 정리
      setSubscribers(prev => {
        const existingSubscriber = prev.find(
          sub => sub.stream?.streamId === event.stream.streamId
        );
        if (existingSubscriber) {
          try {
            existingSubscriber.stream?.disposeWebRtcPeer();
            existingSubscriber.stream?.disposeMediaStream();
          } catch (e) {
            console.warn('기존 스트림 정리 중 에러:', e);
          }
        }
        return prev.filter(sub => sub.stream?.streamId !== event.stream.streamId);
      });

      // 새 스트림 구독
      const subscriber = await subscribeStream(sessionRef.current, event.stream);
      if (!subscriber) return;
      
      setSubscribers(prev => [...prev, subscriber]);
      console.log('✅ 스트림 구독 완료:', event.stream.streamId);

    } catch (error) {
      console.error('스트림 처리 중 에러:', error);
    }
  };

  const handleIceCandidate = async (pc: RTCPeerConnection, event: RTCPeerConnectionIceEvent) => {
    try {
      if (pc.connectionState === 'closed') {
        console.log('PeerConnection이 닫힌 상태여서 ICE candidate 추가 건너뜀');
        return;
      }
      
      if (event.candidate && sessionRef.current) {
        await sessionRef.current.signal({
          type: 'iceCandidate',
          data: JSON.stringify(event.candidate)
        });
      }
    } catch (error) {
      console.warn('ICE candidate 처리 중 무시된 에러:', error);
    }
  };

  const forceResubscribe = async (stream: any) => {
    if (!sessionRef.current) return;
    
    try {
      // 기존 구독 정리
      setSubscribers(prev => {
        prev.forEach(sub => {
          try {
            sub.stream?.disposeWebRtcPeer();
            sub.stream?.disposeMediaStream();
          } catch (e) {
            console.warn('스트림 정리 중 에러:', e);
          }
        });
        return [];
      });

      // 새 스트림 구독
      const subscriber = await subscribeStream(sessionRef.current, stream);
      if (!subscriber) return;
      
      setSubscribers(prev => [...prev, subscriber]);
      console.log('✅ 스트림 강제 재구독 완료:', stream.streamId);
    } catch (error) {
      console.error('스트림 재구독 실패:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const joinSession = async () => {
      try {
        setIsReconnecting(true);

        // 3. 기존 세션 정리 시 타이밍 조정
        if (sessionRef.current) {
          try {
            // 모든 구독자 정리
            setSubscribers(prev => {
              prev.forEach(sub => {
                try {
                  sub.stream?.disposeWebRtcPeer();
                  sub.stream?.disposeMediaStream();
                } catch (e) {
                  console.warn('스트림 정리 중 에러:', e);
                }
              });
              return [];
            });

            // 세션 연결 해제
            await sessionRef.current.disconnect();
            // 충분한 대기 시간 확보
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (error) {
            console.warn('기존 세션 정리 중 에러:', error);
          }
        }

        const { session, publisher } = await openviduService.joinSession(sessionId);
        if (!mounted) return;

        sessionRef.current = session;
        publisherRef.current = publisher;
        retryCountRef.current = 0;

        // 4. WebRTC 연결 상태 모니터링 개선
        if (publisher.stream?.getWebRtcPeer()) {
          const rtcPeer = publisher.stream.getWebRtcPeer();
          const pc = (rtcPeer as any).peerConnection;
          
          if (pc) {
            // ICE candidate 핸들러 등록
            pc.addEventListener('icecandidate', (event: RTCPeerConnectionIceEvent) => 
              handleIceCandidate(pc, event)
            );

            pc.addEventListener('connectionstatechange', () => {
              const currentState = pc.connectionState;
              setConnectionState(currentState);
              console.log('WebRTC 연결 상태:', currentState);
              
              if (currentState === 'connected') {
                setIsReconnecting(false);
                // 연결 성공 시 상대방에게 알림
                session.signal({
                  type: 'connectionStateChange',
                  data: JSON.stringify({
                    userId: localStorage.getItem('userId'),
                    state: 'connected'
                  })
                });
              } else if (['disconnected', 'failed'].includes(currentState)) {
                if (retryCountRef.current < MAX_RETRY_COUNT) {
                  console.log(`재연결 시도 (${retryCountRef.current + 1}/${MAX_RETRY_COUNT})`);
                  retryCountRef.current++;
                  setTimeout(() => joinSession(), RETRY_DELAY);
                }
              }
            });
          }
        }

        // 5. 스트림 이벤트 핸들러 개선
        session.on('streamCreated', async (event) => {
          if (!mounted) return;
          
          console.log('새 스트림 생성됨:', event.stream.streamId);
          await forceResubscribe(event.stream);
        });

        // 6. 연결 상태 변경 신호 처리
        session.on('signal:connectionStateChange', (event) => {
          try {
            if (!event.data) return;
            const { userId, state } = JSON.parse(event.data);
            console.log(`상대방(${userId})의 연결 상태 변경: ${state}`);
            
            // 상대방이 재연결된 경우 강제 재구독 시도
            if (state === 'connected') {
              const remoteStream = session.streamManagers
                .find(sm => sm.stream?.connection?.connectionId !== session.connection?.connectionId)
                ?.stream;
                
              if (remoteStream) {
                forceResubscribe(remoteStream);
              }
            }
          } catch (error) {
            console.warn('연결 상태 신호 처리 중 에러:', error);
          }
        });

        session.on('streamDestroyed', event => {
          console.log('스트림 종료:', event.stream.streamId);
          setSubscribers(prev => 
            prev.filter(sub => sub.stream?.streamId !== event.stream.streamId)
          );
        });

        session.on('sessionDisconnected', () => {
          console.log('세션 연결 종료');
          setSubscribers([]);
          if (mounted) {
            handleLeaveSession();
          }
        });

      } catch (error) {
        console.error('세션 연결 실패:', error);
        if (mounted && retryCountRef.current < MAX_RETRY_COUNT) {
          retryCountRef.current++;
          setTimeout(() => joinSession(), RETRY_DELAY);
        } else {
          alert('연결 실패가 반복되어 세션을 종료합니다.');
          handleLeaveSession();
        }
      }
    };

    if (sessionId && sessionId !== 'default-session') {
      joinSession();
    }

    return () => {
      mounted = false;
      if (sessionRef.current) {
        const session = sessionRef.current;
        setSubscribers(prev => {
          prev.forEach(sub => {
            try {
              sub.stream?.disposeWebRtcPeer();
              sub.stream?.disposeMediaStream();
            } catch (e) {
              console.warn('스트림 정리 중 에러:', e);
            }
          });
          return [];
        });
        session.disconnect();
      }
    };
  }, [sessionId, navigate]);

  const handleToggleCamera = async () => {
    if (publisherRef.current) {
      const newState = !isVideoEnabled;
      try {
        await publisherRef.current.publishVideo(newState);
        setIsVideoEnabled(newState);
      } catch (error) {
        console.error('카메라 토글 중 에러:', error);
      }
    }
  };

  const handleLeaveSession = () => {
    if (sessionRef.current) {
      try {
        sessionRef.current.disconnect();
      } catch (error) {
        console.error('세션 종료 중 에러:', error);
      }
      localStorage.removeItem('currentSessionId');
      navigate('/');
    }
  };

  const handleStartScreenShare = async () => {
    if (!sessionRef.current) return;

    try {
      const OV = sessionRef.current.openvidu;
      const screenPublisher = await OV.initPublisherAsync(undefined, {
        videoSource: 'screen',
        publishAudio: false,
        publishVideo: true,
        mirror: false
      });
      await sessionRef.current.publish(screenPublisher);
      console.log('화면 공유 시작!');
    } catch (error) {
      console.error('화면 공유 에러:', error);
    }
  };

  const subscribeStream = async (session: Session, stream: any, retryCount = 0) => {
    if (!stream || !stream.streamId || !session.connection) {
      console.log('유효하지 않은 스트림 또는 세션:', stream?.streamId);
      return null;
    }

    if (connectionState === 'closed' || connectionState === 'failed') {
      console.log('연결이 이미 종료됨');
      return null;
    }

    try {
      const subscriber = session.subscribe(stream, undefined);
      console.log('✅ 신규 스트림 구독 성공:', stream.streamId);
      return subscriber;
    } catch (error) {
      console.error(`구독 실패 (시도 ${retryCount}):`, error);
      
      if (retryCount < MAX_RETRY_COUNT) {
        const streamExists = session.streamManagers.some(
          sm => sm.stream?.streamId === stream.streamId
        );
        
        if (!streamExists) {
          console.log('스트림이 더 이상 존재하지 않음:', stream.streamId);
          return null;
        }

        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return subscribeStream(session, stream, retryCount + 1);
      } else {
        console.error('최대 재시도 횟수 초과:', stream.streamId);
        return null;
      }
    }
  };

  return (
    <div className="videocall-container">
      {isReconnecting && (
        <div className="reconnecting-overlay">
          <p>재연결 중...</p>
        </div>
      )}
      <header className="videocall-header">
        <h1>화상 통화 중</h1>
        <div className="control-buttons">
          <button onClick={handleToggleCamera}>
            {isVideoEnabled ? '카메라 끄기' : '카메라 켜기'}
          </button>
          <button onClick={handleStartScreenShare}>화면 공유</button>
          <button onClick={handleLeaveSession}>세션 나가기</button>
        </div>
      </header>

      <div className="videocall-content">
        <div className="video-section">
          <div className="video-row local">
            {publisherRef.current && (
              <video
                autoPlay
                playsInline
                ref={(video) => {
                  if (video && publisherRef.current) {
                    publisherRef.current.addVideoElement(video);
                  }
                }}
              />
            )}
            <p>나</p>
          </div>

          <div className="video-row remote">
            {subscribers.length > 0 ? (
              <>
                <video
                  autoPlay
                  playsInline
                  ref={(video) => {
                    if (video && subscribers[0]) {
                      subscribers[0].addVideoElement(video);
                    }
                  }}
                />
                <p>상대방</p>
              </>
            ) : (
              <p style={{ color: '#fff' }}>상대방 대기중...</p>
            )}
          </div>
        </div>

        <div className="game-section">
          <WsGameListPage />
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
