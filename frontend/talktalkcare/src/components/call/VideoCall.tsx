import React, { useEffect, useState, useRef } from 'react';
import { Session, Publisher, Subscriber, StreamManager } from 'openvidu-browser';
import openviduService from '../../services/openviduService';
import { useNavigate } from 'react-router-dom';
import GameListPage from '../../pages/GamePages/GameListPage'; // 실제 경로
import '../../styles/components/VideoCall.css';

const VideoCall: React.FC = () => {
  const navigate = useNavigate();

  const sessionRef = useRef<Session | null>(null);
  const publisherRef = useRef<Publisher | null>(null);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);

  const sessionId = localStorage.getItem('currentSessionId') || 'default-session';

  useEffect(() => {
    let mounted = true;

    const joinSession = async () => {
      try {
        if (sessionRef.current) {
          sessionRef.current.disconnect();
        }
        const { session, publisher } = await openviduService.joinSession(sessionId);
        if (!mounted) return;

        sessionRef.current = session;
        publisherRef.current = publisher;

        // 스트림 생성 이벤트
        session.on('streamCreated', async (event) => {
          try {
            console.log('🔄 스트림 생성 감지:', event.stream.streamId);
            console.log('스트림 상세 정보:', {
              connectionId: event.stream.connection.connectionId,
              hasAudio: event.stream.hasAudio,
              hasVideo: event.stream.hasVideo,
              typeOfVideo: event.stream.typeOfVideo
            });

            const subscriber = await session.subscribe(event.stream, undefined);
            console.log('✅ 구독 성공:', subscriber.stream?.streamId);
            
            subscriber.on('streamPlaying', () => {
              console.log('▶️ 스트림 재생 시작:', event.stream.streamId);
            });

            setSubscribers(prev => {
              // 중복 구독 방지
              if (prev.some(sub => sub.stream?.streamId === subscriber.stream?.streamId)) {
                return prev;
              }
              return [...prev, subscriber];
            });
          } catch (error) {
            console.error('❌ 스트림 구독 실패:', error);
          }
        });

        // 스트림 종료 이벤트
        session.on('streamDestroyed', (event) => {
          console.log('❌ 스트림 종료:', event.stream.streamId);
          setSubscribers(prev => 
            prev.filter(sub => sub.stream?.streamId !== event.stream.streamId)
          );
        });

        // 연결 종료 이벤트
        session.on('sessionDisconnected', (event) => {
          console.log('세션 연결 종료:', event.reason);
          setSubscribers([]);
        });

        // 참가자 퇴장 이벤트
        session.on('streamDestroyed', (event) => {
          console.log('참가자 퇴장:', event.stream.connection.connectionId);
          setSubscribers(prev => 
            prev.filter(sub => sub.stream?.connection?.connectionId !== event.stream.connection.connectionId)
          );
        });

      } catch (error) {
        console.error('세션 접속 실패:', error);
        if (mounted) {
          alert('세션 접속에 실패했습니다.');
          navigate('/');
        }
      }
    };

    joinSession();

    return () => {
      mounted = false;
      if (sessionRef.current) {
        sessionRef.current.disconnect();
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

  // (A) 화면 공유 예시: 브라우저 탭 or 앱 전체 공유
  const handleStartScreenShare = async () => {
    if (!sessionRef.current) return;

    try {
      const OV = sessionRef.current.openvidu;
      const screenPublisher = await OV.initPublisherAsync(undefined, {
        videoSource: 'screen', // 화면 공유
        publishAudio: false,   // 필요하다면 true
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
      <header className="videocall-header">
        <h1>화상 통화 중</h1>
        <div className="control-buttons">
          <button onClick={handleToggleCamera}>
            {isVideoEnabled ? '카메라 끄기' : '카메라 켜기'}
          </button>
          {/* 화면 공유 버튼 예시 */}
          <button onClick={handleStartScreenShare}>화면 공유</button>
          <button onClick={handleLeaveSession}>세션 나가기</button>
        </div>
      </header>

      <div className="videocall-content">
        {/* 왼쪽: 위(내화면), 아래(상대방화면) */}
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

        {/* 오른쪽: 게임 리스트 */}
        <div className="game-section">
          <GameListPage />
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
