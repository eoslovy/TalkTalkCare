import React, { useEffect, useState, useRef } from 'react';
import { Session, Publisher, Subscriber, StreamManager } from 'openvidu-browser';
import openviduService from '../../services/openviduService';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/VideoCall.css';
import WsGameListPage from '../../pages/GamePages/ws/WsGameListPage';
import CustomModal from '../CustomModal';

const VideoCall: React.FC = () => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');

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
            //console.log('✅ 신규 스트림 추가됨:', event.stream.streamId);
            setSubscribers((prev) => [...prev, subscriber]);
          } catch (error) {
            //console.error('신규 스트림 구독 중 에러:', error);
          }
        });

        session.on('streamDestroyed', (event) => {
          //console.log('❌ 스트림 종료:', event.stream.streamId);
          setSubscribers((prev) =>
            prev.filter((sub) => sub.stream?.streamId !== event.stream.streamId)
          );
        });

        session.on('connectionDestroyed', (event) => {
          try {
            const destroyedId = event.connection.connectionId;
            //console.log('연결 종료됨:', destroyedId);
            setSubscribers((prev) =>
              prev.filter((sub) => sub.stream?.connection?.connectionId !== destroyedId)
            );
          } catch (err) {
            //console.error('connectionDestroyed 처리 중 에러:', err);
          }
        });
      } catch (error) {
        //console.error('세션 접속 실패:', error);
        setModalMessage('일시적인 서버 오류가 발생했습니다.');
        setIsModalOpen(true);
        // navigate('/');
      }
    };

    joinSession();

    return () => {
      mounted = false;
      if (sessionRef.current) {
        try {
          sessionRef.current.disconnect();
        } catch (error) {
          //console.error('세션 종료 중 에러:', error);
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
        //console.error('카메라 토글 중 에러:', error);
      }
    }
  };

  const handleLeaveSession = () => {
    if (sessionRef.current) {
      try {
        sessionRef.current.disconnect();
      } catch (error) {
        //console.error('세션 종료 중 에러:', error);
      }
      localStorage.removeItem('currentSessionId');
      localStorage.removeItem('opponentUserId');
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
      //console.log('화면 공유 시작!');
    } catch (error) {
      //console.error('화면 공유 에러:', error);
    }
  };

  return (
    <div className="videocall-container">
      <header className="videocall-header">
        <h1>화상 통화 중</h1>
        <div className="videocall-control-buttons">
          <button className="videocall-button" onClick={handleToggleCamera}>
            {isVideoEnabled ? '카메라 끄기' : '카메라 켜기'}
          </button>
          <button className="videocall-button" onClick={handleStartScreenShare}>
            화면 공유
          </button>
          <button className="videocall-button" onClick={handleLeaveSession}>
            세션 나가기
          </button>
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
          <WsGameListPage />
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
