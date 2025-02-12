import React, { useState, useEffect } from 'react';
import './videocall.css';

const VideoCall: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 3초 후 로딩 상태 해제
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="video-call-container">
      {isLoading ? (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>잠시만 기다려주세요...</p>
          </div>
        </div>
      ) : (
        <div className="video-layout">
          <div className="control-panel">
            <div className="user-info">
              <h3>00게임</h3>
              <p>통화 중...</p>
            </div>
            <div className="control-buttons">
              <button className="mic-button">
                <span className="icon">🎤</span>
                마이크 켜짐
              </button>
              <button className="camera-button">
                <span className="icon">📷</span>
                카메라 켜짐
              </button>
            </div>
          </div>
          <div className="video-screen">
            <div className="main-video">
              {/* 메인 비디오 화면 */}
            </div>
            <div className="sub-video">
              {/* 작은 비디오 화면 */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
