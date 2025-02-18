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
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);

  const sessionRef = useRef<Session | null>(null);
  const publisherRef = useRef<Publisher | null>(null);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);

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

        // WebRTC 연결 상태 모니터링
        if (publisher.stream?.getWebRtcPeer()) {
          const rtcPeer = publisher.stream.getWebRtcPeer();
          const pc = (rtcPeer as any).peerConnection;
          
          if (pc) {
            pc.oniceconnectionstatechange = async () => {
              console.log(`🧊 ICE 상태: ${pc.iceConnectionState}`);
              if (pc.iceConnectionState === 'failed') {
                console.log('⚠️ ICE 연결 실패: 재연결 시도');
                await pc.restartIce();
              }
            };

            pc.onconnectionstatechange = () => {
              console.log(`🔌 Connection 상태: ${pc.connectionState}`);
            };

            pc.ontrack = (event: RTCTrackEvent) => {
              console.log(`🎥 트랙 수신: ${event.track.kind}, 상태: ${event.track.readyState}`);
            };
          }
        }

        // 로컬 비디오 바인딩
        if (localVideoRef.current && publisher) {
          publisher.addVideoElement(localVideoRef.current);
          console.log('✅ 로컬 비디오 바인딩 완료');
        }

        // OpenVidu 세션 이벤트
        session.on('streamCreated', (event) => {
          try {
            const subscriber = session.subscribe(event.stream, undefined);
            console.log('✅ 신규 스트림 추가됨:', event.stream.streamId);

            subscriber.on('videoElementCreated', (ev) => {
              const videoElement = ev.element as HTMLVideoElement;
              videoElement.setAttribute('playsinline', 'true');
              videoElement.autoplay = true;
              videoElement.controls = false;
              console.log('🎥 구독자 비디오 엘리먼트 바인딩 완료');

              // 비디오 트랙 상태 확인
              const stream = subscriber.stream.getMediaStream();
              stream.getVideoTracks().forEach((track) => {
                console.log('📹 구독자 비디오 트랙 상태:', {
                  enabled: track.enabled,
                  muted: track.muted,
                  readyState: track.readyState,
                });
              });

              // 구독자 목록에 추가
              setSubscribers(prev => [...prev, subscriber]);
            });

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

        session.on('exception', (exception) => {
          console.warn('세션 예외 발생:', exception);
          if (exception.name === 'ICE_CONNECTION_FAILED') {
            setModalMessage('네트워크 연결에 문제가 발생했습니다.');
            setIsModalOpen(true);
          }
        });

        session.on('sessionDisconnected', (event) => {
          console.log('세션 연결 종료:', event.reason);
          setSubscribers([]);
          if (mounted) {
            setModalMessage('세션이 종료되었습니다.');
            setIsModalOpen(true);
          }
        });

      } catch (error) {
        console.error('세션 접속 실패:', error);
        setModalMessage('연결 중 오류가 발생했습니다.');
        setIsModalOpen(true);
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
        <div className="video-section">
          <div className="video-row local">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
            />
            <p>나</p>
          </div>

          <div className="video-row remote">
            {subscribers.map((subscriber, index) => (
              <div key={subscriber.stream?.streamId} className="remote-video-container">
                <video
                  ref={el => videoRefs.current[index] = el!}
                  autoPlay
                  playsInline
                />
                <p>상대방 {index + 1}</p>
              </div>
            ))}
            {subscribers.length === 0 && (
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
      />
    </div>
  );
};

export default VideoCall;
