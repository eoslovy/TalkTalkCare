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

  // --- Event Handlers ---
  const handleStreamCreated = (event: any) => {
    const streamId = event.stream.streamId;
    console.log(`📥 신규 스트림 수신: ${streamId}`);

    // 이미 구독 중이면 등록하지 않음
    if (subscribers.some(sub => sub.stream?.streamId === streamId)) {
      console.warn(`⚠️ 이미 구독 중인 스트림: ${streamId}`);
      return;
    }

    const subscriber = sessionRef.current!.subscribe(event.stream, undefined);
    console.log(`✅ 구독 성공: ${streamId}`);

    // 구독자 비디오 바인딩
    const videoElement = videoRefs.current.get(streamId);
    if (videoElement && !videoElement.dataset.bound) {
      subscriber.addVideoElement(videoElement);
      videoElement.dataset.bound = 'true';
      console.log(`📡 비디오 바인딩 완료: ${streamId}`);
    }

    // 중복 제거 후 업데이트
    setSubscribers(prev => {
      const uniqueSubs = new Map(prev.map(sub => [sub.stream?.streamId, sub]));
      uniqueSubs.set(streamId, subscriber);
      return Array.from(uniqueSubs.values());
    });
  };

  const handleStreamDestroyed = (event: any) => {
    const streamId = event.stream.streamId;
    console.log(`❌ 스트림 종료: ${streamId}`);
    setSubscribers(prev => prev.filter(sub => sub.stream?.streamId !== streamId));
    videoRefs.current.delete(streamId);
  };

  const handleSessionException = async (exception: any) => {
    console.warn('⚠️ WebRTC 예외 발생:', exception);
    let message = '알 수 없는 오류가 발생했습니다.';
    let retryCount = 0;

    switch (exception.name) {
        case 'ICE_CONNECTION_FAILED':
            message = 'TURN 서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.';
            console.log("🔄 ICE Candidate 재시도 중...");

            const retryIceConnection = setInterval(async () => {
                if (retryCount >= 5) {  // 5번까지 재시도
                    clearInterval(retryIceConnection);
                    console.log("❌ ICE Candidate 재시도 실패");
                } else {
                    retryCount++;
                    console.log(`🔄 ICE Candidate 재시도 ${retryCount}회`);
                    
                    await handleLeaveSession();
                    await openviduService.joinSession(sessionId);
                }
            }, 5000);  // 5초 간격으로 수정
            break;

        case 'ICE_CANDIDATE_ERROR':
            message = 'TURN 서버 인증에 실패했습니다. 잠시 후 다시 시도해주세요.';
            break;

        case 'PEER_CONNECTION_ERROR':
            message = 'WebRTC 연결에 문제가 발생했습니다.';
            break;

        default:
            break;
    }
    setModalMessage(message);
    setIsModalOpen(true);
};


  const handleSessionDisconnected = () => {
    console.log('🧹 세션 종료: 리소스 정리');
    videoRefs.current.clear();
    setSubscribers([]);
  };

  // --- 이벤트 리스너 등록 (마운트 시 한 번만) ---
  useEffect(() => {
    const session = sessionRef.current;
    if (!session) return;

    // 기존 리스너 제거 후 등록
    session.off('streamCreated');
    session.off('streamDestroyed');
    session.off('exception');
    session.off('sessionDisconnected');
    console.log('🧹 기존 세션 리스너 제거 완료');

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
  }, []); // 한 번만 등록

  // --- Publisher 초기화 ---
  const handleInitPublisher = async () => {
    try {
      if (publisherRef.current) {
        console.log('⚠️ Publisher가 이미 존재함. 재사용');
        return;
      }

      const OV = sessionRef.current!.openvidu;
      const publisher = await OV.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: true,
        publishVideo: true,
        mirror: true,
      });

      // WebRTC 상태 체크
      const rtcPeerConnection = publisher.stream?.getRTCPeerConnection();
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
      }

      if (localVideoRef.current) {
        publisher.addVideoElement(localVideoRef.current);
        console.log('🎥 로컬 비디오 바인딩 완료');
      }

      await sessionRef.current!.publish(publisher);
      publisherRef.current = publisher;
      console.log('✅ Publisher 세션 등록 완료');
    } catch (error) {
      console.error('🚨 Publisher 초기화 실패:', error);
      setModalMessage('카메라 초기화 중 오류가 발생했습니다.');
      setIsModalOpen(true);
    }
  };

  // --- 카메라 ON/OFF ---
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

  // --- 세션 나가기 ---
  const handleLeaveSession = async () => {
    if (sessionRef.current) {
        try {
            if (publisherRef.current) {
                await sessionRef.current.unpublish(publisherRef.current);  
                publisherRef.current = null;
                console.log('🧹 Publisher 스트림 정리 완료');
            }
            
            // disconnect는 마지막에 실행하고 완료될 때까지 대기
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

  // --- 화면 공유 ---
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

  // --- 세션 접속 및 Publisher 초기화 ---
  useEffect(() => {
    let mounted = true;
    const joinSession = async () => {
      try {
        // 세션이 없을 경우에만 새로 연결합니다.
        if (!sessionRef.current) {
          const { session } = await openviduService.joinSession(sessionId);
          if (!mounted) return;
          sessionRef.current = session;
        }
        // Publisher가 아직 초기화되지 않았다면 초기화합니다.
        if (!publisherRef.current) {
          await handleInitPublisher();
        }
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
          if (publisherRef.current) {
            publisherRef.current.stream.disposeWebRtcPeer();
            publisherRef.current = null;
          }
          sessionRef.current.disconnect();
          sessionRef.current = null;
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
