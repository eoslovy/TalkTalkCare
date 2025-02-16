import React, { useEffect, useState, useRef } from 'react';
import { Session, Publisher, Subscriber, StreamManager } from 'openvidu-browser';
import openviduService from '../../services/openviduService';
import { useNavigate } from 'react-router-dom';
import GameListPage from '../../pages/GamePages/GameListPage'; // 실제 경로에 맞게 import
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

        session.on('streamCreated', (event) => {
          try {
            const subscriber = session.subscribe(event.stream, undefined);
            console.log('✅ 신규 스트림 추가됨:', event.stream.streamId);
            setSubscribers((prev) => [...prev, subscriber]);
          } catch (error) {
            console.error('신규 스트림 구독 중 에러:', error);
          }
        });

        session.on('streamDestroyed', (event) => {
          console.log('❌ 스트림 종료:', event.stream.streamId);
          setSubscribers((prev) =>
            prev.filter((sub) => sub.stream?.streamId !== event.stream.streamId)
          );
        });

        session.on('connectionDestroyed', (event) => {
          try {
            const destroyedId = event.connection.connectionId;
            console.log('연결 종료됨:', destroyedId);
            setSubscribers((prev) =>
              prev.filter((sub) => sub.stream?.connection?.connectionId !== destroyedId)
            );
          } catch (err) {
            console.error('connectionDestroyed 처리 중 에러:', err);
          }
        });
      } catch (error) {
        console.error('세션 접속 실패:', error);
        alert('세션 접속에 실패했습니다.');
        navigate('/');
      }
    };

    joinSession();

    return () => {
      mounted = false;
      if (sessionRef.current) {
        try {
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
        mirror: false,
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
          <button onClick={handleStartScreenShare}>화면 공유</button>
          <button onClick={handleLeaveSession}>세션 나가기</button>
        </div>
      </header>

      <div className="videocall-content">
        {/* 왼쪽: 화상통화 영역 */}
        <div className="video-section">
          {/* 위: 내 화면 */}
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

          {/* 아래: 상대방 화면 */}
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
              <p style={{ color: '#000' }}>상대방 대기중...</p>
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
