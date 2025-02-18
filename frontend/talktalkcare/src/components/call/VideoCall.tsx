import React, { useEffect, useState, useRef } from 'react';
import { Session, Publisher, Subscriber } from 'openvidu-browser';
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
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const localVideoRef = useRef<HTMLVideoElement>(null);

  /** ✅ 구독자 비디오 바인딩 */
  useEffect(() => {
    subscribers.forEach(sub => {
      const streamId = sub.stream?.streamId || '';
      const videoElement = videoRefs.current.get(streamId);

      if (videoElement && !videoElement.dataset.bound) {
        sub.addVideoElement(videoElement);
        videoElement.dataset.bound = 'true';
        console.log(`📡 구독자 비디오 바인딩 완료: ${streamId}`);

        const stream = sub.stream?.getMediaStream();
        if (stream) {
          stream.getVideoTracks().forEach(track => {
            console.log('📹 구독자 비디오 트랙 상태:', {
              enabled: track.enabled,
              muted: track.muted,
              readyState: track.readyState,
            });
          });
        }
      }
    });
  }, [subscribers]);

  /** 🧹 videoRefs 메모리 정리 */
  useEffect(() => {
    return () => {
      videoRefs.current.clear();
      console.log('🧹 비디오 참조 정리 완료');
    };
  }, []);

  /** 🟢 Publisher 초기화 후 즉시 로컬 비디오 바인딩 */
  const handleInitPublisher = async () => {
    try {
      const OV = sessionRef.current!.openvidu;
      const publisher = await OV.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: true,
        publishVideo: true,
        mirror: true,
      });
      publisherRef.current = publisher;

      // 🎥 로컬 비디오 즉시 바인딩
      if (localVideoRef.current) {
        publisher.addVideoElement(localVideoRef.current);
        console.log('🎥 로컬 비디오 즉시 바인딩 완료');
      }

      // 세션에 Publisher 등록
      await sessionRef.current!.publish(publisher);
      console.log('✅ Publisher 세션 등록 완료');
    } catch (error) {
      console.error('🚨 Publisher 초기화 실패:', error);
    }
  };

  /** 🎥 카메라 ON/OFF */
  const handleToggleCamera = async () => {
    if (publisherRef.current) {
      const newState = !isVideoEnabled;
      publisherRef.current.publishVideo(newState);
      setIsVideoEnabled(newState);
      console.log(`🚀 카메라 ${newState ? 'ON' : 'OFF'}`);
    } else {
      console.error('🚨 Publisher가 존재하지 않음');
    }
  };

  // 이벤트 핸들러 함수들
  const handleStreamCreated = (event: any) => {
    const streamId = event.stream.streamId;
    console.log(`📥 신규 스트림 수신: ${streamId}`);

    // 이미 구독된 스트림인지 체크
    const isAlreadySubscribed = subscribers.some(
      (sub) => sub.stream?.streamId === streamId
    );
    if (isAlreadySubscribed) {
      console.warn(`⚠️ 이미 구독 중인 스트림: ${streamId}`);
      return;
    }

    // 새 구독자 등록
    const subscriber = sessionRef.current!.subscribe(event.stream, undefined);
    console.log(`✅ 구독 성공: ${streamId}`);

    // 구독자 비디오 바인딩
    const videoElement = videoRefs.current.get(streamId);
    if (videoElement && !videoElement.dataset.bound) {
      subscriber.addVideoElement(videoElement);
      videoElement.dataset.bound = 'true';
      console.log(`📡 비디오 바인딩 완료: ${streamId}`);
    }

    // 📡 구독자 상태 업데이트 (streamId 기반 중복 제거)
    setSubscribers((prev) => {
      const uniqueSubscribers = new Map(prev.map((sub) => [sub.stream?.streamId, sub]));
      uniqueSubscribers.set(streamId, subscriber);
      return Array.from(uniqueSubscribers.values());
    });
  };

  const handleStreamDestroyed = (event: any) => {
    const streamId = event.stream.streamId;
    console.log(`❌ 스트림 종료: ${streamId}`);
    setSubscribers(prev => 
      prev.filter(sub => sub.stream?.streamId !== streamId)
    );
    videoRefs.current.delete(streamId);
  };

  const handleSessionException = (exception: any) => {
    console.warn('⚠️ 세션 예외 발생:', exception);
    switch (exception.name) {
      case 'ICE_CONNECTION_FAILED':
        setModalMessage('네트워크 연결에 문제가 발생했습니다.');
        break;
      case 'networkDisconnected':
        setModalMessage('네트워크가 끊겼습니다. 다시 연결해 주세요.');
        break;
      case 'tokenExpired':
        setModalMessage('세션 토큰이 만료되었습니다. 다시 로그인해 주세요.');
        break;
      default:
        setModalMessage('알 수 없는 오류가 발생했습니다.');
    }
    setIsModalOpen(true);
  };

  const handleSessionDisconnected = () => {
    console.log('🧹 세션 종료: 리소스 정리');
    videoRefs.current.clear();
    setSubscribers([]);
  };

  // 세션 이벤트 리스너 관리
  useEffect(() => {
    const session = sessionRef.current;
    if (!session) return;

    // 기존 모든 리스너 제거
    session.off('streamCreated');
    session.off('streamDestroyed');
    session.off('exception');
    session.off('sessionDisconnected');
    console.log('🧹 기존 세션 리스너 제거 완료');

    // 리스너 재등록
    session.on('streamCreated', handleStreamCreated);
    session.on('streamDestroyed', handleStreamDestroyed);
    session.on('exception', handleSessionException);
    session.on('sessionDisconnected', handleSessionDisconnected);
    console.log('✅ 세션 리스너 등록 완료');

    return () => {
      session.off('streamCreated');
      session.off('streamDestroyed');
      session.off('exception');
      session.off('sessionDisconnected');
      console.log('🧹 모든 세션 리스너 클린업 완료');
    };
  }, [subscribers]);

  /** 🚪 세션 나가기 */
  const handleLeaveSession = () => {
    if (sessionRef.current) {
      try {
        // Publisher 종료
        if (publisherRef.current) {
          publisherRef.current.stream.disposeWebRtcPeer();
          publisherRef.current = null;
          console.log('🧹 Publisher 리소스 정리 완료');
        }
        sessionRef.current.disconnect();
      } catch (error) {
        console.error('🚨 세션 종료 중 에러:', error);
      }
      localStorage.removeItem('currentSessionId');
      navigate('/');
    }
  };

  /** 🖥️ 화면 공유 */
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
      console.log('🖥️ 화면 공유 시작!');
    } catch (error) {
      console.error('🚨 화면 공유 에러:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const joinSession = async () => {
      try {
        if (sessionRef.current) {
          sessionRef.current.disconnect();
        }
        const { session } = await openviduService.joinSession(sessionId);
        if (!mounted) return;

        sessionRef.current = session;
        
        // Publisher 초기화 및 로컬 비디오 바인딩
        await handleInitPublisher();

      } catch (error) {
        console.error('세션 접속 실패:', error);
        if (!((error as any)?.response?.status === 409)) {
          setModalMessage('연결 중 오류가 발생했습니다.');
          setIsModalOpen(true);
        }
      }
    };

    joinSession();

    return () => {
      mounted = false;
      if (sessionRef.current) {
        try {
          // Publisher 리소스 정리
          if (publisherRef.current) {
            publisherRef.current.stream.disposeWebRtcPeer();
            publisherRef.current = null;
          }
          sessionRef.current.disconnect();
        } catch (error) {
          console.error('세션 종료 중 에러:', error);
        }
      }
      videoRefs.current.clear();
    };
  }, [sessionId, navigate]);

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
            {subscribers.map((subscriber) => (
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
        title="알림"
      />
    </div>
  );
};

export default VideoCall;
