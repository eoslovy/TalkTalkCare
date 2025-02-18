import React, { useEffect, useState, useRef } from 'react';
import { Session, Publisher, Subscriber, StreamManager } from 'openvidu-browser';
import openviduService from '../../services/openviduService';
import { useNavigate } from 'react-router-dom';
import GameListPage from '../../pages/GamePages/GameListPage'; // 실제 경로
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

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const joinSession = async () => {
      if (retryCountRef.current >= MAX_RETRY_COUNT) {
        console.log('최대 재연결 시도 횟수 초과');
        handleLeaveSession();
        return;
      }

      try {
        setIsReconnecting(true);

        if (sessionRef.current) {
          await sessionRef.current.disconnect();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const { session, publisher } = await openviduService.joinSession(sessionId);
        if (!mounted) return;

        sessionRef.current = session;
        publisherRef.current = publisher;
        retryCountRef.current = 0;
        setIsReconnecting(false);

        if (publisher.stream && publisher.stream.getWebRtcPeer()) {
          const rtcPeer = publisher.stream.getWebRtcPeer();
          const pc = (rtcPeer as any).peerConnection;
          
          if (pc) {
            pc.addEventListener('connectionstatechange', () => {
              const currentState = pc.connectionState;
              if (currentState) {
                setConnectionState(currentState);
                console.log('WebRTC 연결 상태 변경:', currentState);
              }
            });
          }
        }

        session.on('streamCreated', async (event) => {
          if (!mounted) return;
          
          console.log('새 스트림 생성됨:', event.stream.streamId);
          
          try {
            if (connectionState === 'closed' || connectionState === 'failed') {
              console.log('연결이 유효하지 않아 구독 건너뜀');
              return;
            }

            const subscriber = await subscribeStream(session, event.stream);
            if (!mounted || !subscriber) return;
            
            setSubscribers(prev => {
              const filteredPrev = prev.filter(sub => {
                if (sub.stream?.streamId === event.stream.streamId) {
                  try {
                    sub.stream.disposeWebRtcPeer();
                    sub.stream.disposeMediaStream();
                  } catch (e) {
                    console.warn('스트림 정리 중 에러:', e);
                  }
                  return false;
                }
                return true;
              });
              return [...filteredPrev, subscriber];
            });

            session.signal({
              type: 'streamReconnected',
              data: JSON.stringify({
                streamId: event.stream.streamId,
                userId: localStorage.getItem('userId')
              })
            });

          } catch (error) {
            console.error('신규 스트림 구독 중 최종 에러:', error);
            if (mounted && retryCountRef.current < MAX_RETRY_COUNT) {
              retryCountRef.current++;
              retryTimeout = setTimeout(() => {
                console.log(`세션 재연결 시도 (${retryCountRef.current}/${MAX_RETRY_COUNT})...`);
                joinSession();
              }, RETRY_DELAY);
            }
          }
        });

        session.on('signal:streamReconnected', (event) => {
          try {
            if (!event.data) {
              throw new Error('신호 데이터가 없습니다');
            }
            const data = JSON.parse(event.data) as StreamReconnectData;
            console.log(`상대방(${data.userId})이 재연결됨. 스트림 ID: ${data.streamId}`);
          } catch (error) {
            console.error('재연결 신호 파싱 에러:', error);
          }
        });

        session.on('streamDestroyed', (event) => {
          console.log('❌ 스트림 종료:', event.stream.streamId);
          
          setSubscribers(prev => 
            prev.filter(sub => {
              if (sub.stream?.streamId === event.stream.streamId) {
                try {
                  sub.stream.disposeWebRtcPeer();
                  sub.stream.disposeMediaStream();
                } catch (e) {
                  console.warn('스트림 정리 중 에러:', e);
                }
                return false;
              }
              return true;
            })
          );
        });

        session.on('sessionDisconnected', async (event) => {
          console.log('세션 연결 종료:', event.reason);
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
          
          if (event.reason !== 'disconnect' && mounted) {
            retryTimeout = setTimeout(() => {
              console.log('세션 재연결 시도...');
              joinSession();
            }, 2000);
          }
        });

        session.on('exception', (event) => {
          console.error('세션 에러:', event);
          handleLeaveSession();
        });
      } catch (error) {
        console.error('세션 접속 실패:', error);
        if (mounted && retryCountRef.current < MAX_RETRY_COUNT) {
          retryCountRef.current++;
          retryTimeout = setTimeout(() => {
            console.log(`세션 재연결 시도 (${retryCountRef.current}/${MAX_RETRY_COUNT})...`);
            joinSession();
          }, RETRY_DELAY);
        } else {
          alert('연결 실패가 반복되어 세션을 종료합니다.');
          handleLeaveSession();
        }
      }
    };

    // 페이지 로드 시 세션 ID가 있으면 자동 연결
    if (sessionId && sessionId !== 'default-session') {
      joinSession();
    }

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      retryCountRef.current = MAX_RETRY_COUNT;
      
      if (sessionRef.current) {
        try {
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
          sessionRef.current.disconnect();
        } catch (error) {
          console.error('세션 종료 중 에러:', error);
        }
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
          <GameListPage />
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
