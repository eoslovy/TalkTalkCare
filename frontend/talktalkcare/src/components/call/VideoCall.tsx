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

        // WebRTC 연결 상태 모니터링
        if (publisher.stream?.getWebRtcPeer()) {
          const rtcPeer = publisher.stream.getWebRtcPeer();
          const pc = (rtcPeer as any).peerConnection;
          
          if (pc) {
            // ICE 연결 상태 모니터링
            pc.addEventListener('iceconnectionstatechange', () => {
              console.log('ICE 연결 상태:', pc.iceConnectionState);
              if (pc.iceConnectionState === 'failed') {
                console.log('TURN 서버를 통한 재연결 시도...');
                pc.restartIce();
                setModalMessage('네트워크 연결 문제가 발생했습니다. 재연결을 시도합니다.');
                setIsModalOpen(true);
              }
            });

            // 연결 상태 모니터링
            pc.addEventListener('connectionstatechange', () => {
              console.log('연결 상태:', pc.connectionState);
              if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                setModalMessage('연결이 끊어졌습니다. 재연결을 시도합니다.');
                setIsModalOpen(true);
              }
            });

            pc.addEventListener('icegatheringstatechange', () => {
              console.log('ICE Gathering 상태:', pc.iceGatheringState);
            });

            pc.addEventListener('icecandidate', (event: RTCPeerConnectionIceEvent) => {
              if (event.candidate) {
                console.log('ICE candidate:', event.candidate.candidate);
              } else {
                console.log('ICE 후보 수집 완료');
              }
            });
          }
        }

        // OpenVidu 세션 이벤트
        session.on('streamCreated', (event) => {
          try {
            const subscriber = session.subscribe(event.stream, undefined);
            console.log('✅ 신규 스트림 추가됨:', event.stream.streamId);
            
            // trackPlaying 이벤트 추가
            subscriber.on('videoElementCreated', (event) => {
              console.log('비디오 엘리먼트 생성됨:', event.element);
              event.element.addEventListener('play', () => {
                console.log('🎉 비디오 재생 시작');
              });
            });

            setSubscribers(prev => {
              if (prev.some(sub => sub.stream?.streamId === event.stream.streamId)) {
                return prev;
              }
              return [...prev, subscriber];
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
        setModalMessage('일시적인 서버 오류가 발생했습니다.');
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

  useEffect(() => {
    if (publisherRef.current) {
      const localVideo = document.getElementById('local-video') as HTMLVideoElement;
      if (localVideo) {
        publisherRef.current.addVideoElement(localVideo);
      }
    }

    subscribers.forEach((sub, index) => {
      const remoteVideo = document.getElementById(`remote-video-${index}`) as HTMLVideoElement;
      if (remoteVideo) {
        sub.addVideoElement(remoteVideo);
      }
    });
  }, [subscribers]);

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
              id="local-video"
              autoPlay
              playsInline
              muted // 자기 소리는 음소거
            />
            <p>나</p>
          </div>

          <div className="video-row remote">
            {subscribers.map((subscriber, index) => (
              <div key={subscriber.stream?.streamId} className="remote-video-container">
                <video
                  id={`remote-video-${index}`}
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

        {/* 오른쪽: 게임 리스트 */}
        <div className="game-section">
          <WsGameListPage />
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
