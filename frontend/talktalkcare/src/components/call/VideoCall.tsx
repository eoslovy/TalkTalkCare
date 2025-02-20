import React, { useEffect, useState, useRef } from 'react';
import { Session, Publisher, Subscriber, StreamManager } from 'openvidu-browser';
import openviduService from '../../services/openviduService';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/VideoCall.css';
import WsGameListPage from '../../pages/GamePages/ws/WsGameListPage';
import CustomModal from '../CustomModal';

const VideoCall: React.FC = () => {
  const navigate = useNavigate();
  const sessionId = localStorage.getItem('currentSessionId') || 'default-session';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const sessionRef = useRef<Session | null>(null);
  const publisherRef = useRef<Publisher | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // ✅ 세션 참여 - 에러 처리 및 재연결 로직 강화
  useEffect(() => {
    let mounted = true;

    const joinSession = async () => {
      try {
        if (sessionRef.current) {
          await handleLeaveSession(); // 기존 세션 정리를 비동기로 처리
        }
        const { session, publisher } = await openviduService.joinSession(sessionId);
        if (!mounted) return;

        sessionRef.current = session;
        publisherRef.current = publisher;

        // ✅ ICE Connection 상태 체크 개선
        if (publisher.stream) {
          const rtcPeerConnection = publisher.stream.getRTCPeerConnection();
          if (rtcPeerConnection) {
            console.log(`📡 Publisher ICE Connection State: ${rtcPeerConnection.iceConnectionState}`);

            rtcPeerConnection.oniceconnectionstatechange = () => {
              console.log(`📡 ICE 상태 변경: ${rtcPeerConnection.iceConnectionState}`);
              if (rtcPeerConnection.iceConnectionState === 'failed') {
                console.warn("❌ ICE Connection 실패! 5초 후 재시도...");
                setTimeout(async () => {
                  await handleLeaveSession();
                  await openviduService.joinSession(sessionId);
                }, 5000);
              }
            };

            // ✅ 추가: 연결 상태 모니터링
            rtcPeerConnection.onconnectionstatechange = () => {
              console.log('연결 상태:', rtcPeerConnection.connectionState);
              if (rtcPeerConnection.connectionState === 'failed') {
                setModalMessage('연결이 끊어졌습니다. 재연결을 시도합니다.');
                setIsModalOpen(true);
              }
            };
          }
        }

        // ✅ 이벤트 리스너 등록
        session.on('streamCreated', (event) => {
          const subscriber = session.subscribe(event.stream, undefined);
          console.log('✅ 신규 스트림 추가됨:', event.stream.streamId);

          // ✅ 비디오 요소 바인딩
          subscriber.on('videoElementCreated', (event) => {
            console.log('🎥 비디오 재생 시작:', event.element);
          });

          // ✅ 중복 방지 후 추가
          setSubscribers(prev => {
            if (prev.some(sub => sub.stream?.streamId === event.stream.streamId)) return prev;
            return [...prev, subscriber];
          });
        });

        session.on('streamDestroyed', (event) => {
          console.log('❌ 스트림 종료:', event.stream.streamId);
          setSubscribers(prev => prev.filter(sub => sub.stream?.streamId !== event.stream.streamId));
        });

        session.on('sessionDisconnected', () => {
          console.log('🛑 세션 종료됨');
          setSubscribers([]);
          setIsModalOpen(true);
        });

        // ✅ 추가: 세션 예외 처리
        session.on('exception', (exception) => {
          console.warn('세션 예외 발생:', exception);
          if (exception.name === 'ICE_CONNECTION_FAILED') {
            setModalMessage('네트워크 연결에 문제가 발생했습니다.');
            setIsModalOpen(true);
          }
        });

      } catch (error) {
        console.error('🚨 세션 접속 실패:', error);
        if (mounted) {
          setModalMessage('연결 중 오류가 발생했습니다.');
          setIsModalOpen(true);
        }
      }
    };

    joinSession();

    return () => {
      mounted = false;
      handleLeaveSession(); // cleanup에서도 비동기 처리된 함수 사용
    };
  }, [sessionId, navigate]);

  // ✅ 구독자 비디오 요소 업데이트
  useEffect(() => {
    subscribers.forEach((subscriber) => {
      const streamId = subscriber.stream?.streamId;
      if (!streamId) return;
      
      const videoElement = videoRefs.current.get(streamId);
      if (videoElement) {
        subscriber.addVideoElement(videoElement);
      }
    });
  }, [subscribers]);

  // ✅ 카메라 ON/OFF
  const handleToggleCamera = async () => {
    if (publisherRef.current) {
      const newState = !isVideoEnabled;
      await publisherRef.current.publishVideo(newState);
      setIsVideoEnabled(newState);
    }
  };

  // ✅ 세션 나가기 - 비동기 처리 추가
  const handleLeaveSession = async () => {
    if (sessionRef.current) {
      try {
        if (publisherRef.current) {
          await sessionRef.current.unpublish(publisherRef.current);
          publisherRef.current = null;
          console.log('🧹 Publisher 스트림 정리 완료');
        }
        
        await sessionRef.current.disconnect();
        sessionRef.current = null;
        console.log('✅ 세션 연결 종료 완료');
      } catch (error) {
        console.error('🚨 세션 종료 중 에러:', error);
      }
      localStorage.removeItem('currentSessionId');
      navigate('/');
    }
  };

  // ✅ 화면 공유 - 에러 처리 개선
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
      console.log('📡 화면 공유 시작');
    } catch (error) {
      console.error('🚨 화면 공유 에러:', error);
      setModalMessage('화면 공유 중 오류가 발생했습니다.');
      setIsModalOpen(true);
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
        <div className="video-section">
          <div className="video-row local">
            <video ref={localVideoRef} autoPlay playsInline muted />
            <p>나</p>
          </div>

          <div className="video-row remote">
            {subscribers.length > 0 ? (
              subscribers.map((subscriber) => (
                <div key={subscriber.stream?.streamId} className="remote-video-container">
                  <video
                    ref={el => {
                      if (el && subscriber.stream?.streamId) {
                        videoRefs.current.set(subscriber.stream.streamId, el);
                      }
                    }}
                    autoPlay
                    playsInline
                  />
                  <p>상대방</p>
                </div>
              ))
            ) : (
              <p style={{ color: '#fff' }}>상대방 대기중...</p>
            )}
          </div>
        </div>

        <div className="game-section">
          <WsGameListPage />
        </div>
      </div>

      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={modalMessage}
        title="알림"
      />
    </div>
  );
};

export default VideoCall;
