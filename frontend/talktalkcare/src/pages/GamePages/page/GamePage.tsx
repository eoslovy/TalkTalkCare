import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/GamePage.css';
import GameOverModal from './GameOverModal'; // GameOverModal 컴포넌트를 임포트

interface GamePageProps {
  title: string;
  timeLimit?: number;
  currentTime?: number;
  previewTime?: number;
  children: React.ReactNode;
  onRestart?: () => void;
  gameStarted?: boolean;
  isPreview?: boolean;
  pauseTimer?: boolean;
  gameOver?: boolean; // 게임 오버 상태 추가
  score?: number; // 점수 추가
  message?: string; // 메시지 추가
}

const DEFAULT_TIME_LIMIT = 60;
const DEFAULT_PREVIEW_TIME = 10;

const GamePage: React.FC<GamePageProps> = ({ 
  title, 
  timeLimit,
  currentTime,
  previewTime = DEFAULT_PREVIEW_TIME,
  children, 
  onRestart,
  gameStarted = false,
  isPreview = false,
  pauseTimer = false,
  gameOver = false, // 기본값 false
  score = 0, // 기본값 0
  message = '게임이 종료되었습니다!' // 기본 메시지
}) => {
  const navigate = useNavigate();
  const actualTimeLimit = timeLimit || DEFAULT_TIME_LIMIT;
  const [internalTime, setInternalTime] = useState(actualTimeLimit);
  const [timePercentage, setTimePercentage] = useState(100);
  const [currentPreviewTime, setCurrentPreviewTime] = useState(previewTime);
  
  // 실제 사용할 현재 시간 (외부에서 받은 currentTime이 있으면 그것을 사용)
  const actualCurrentTime = currentTime !== undefined ? currentTime : internalTime;

  const handleRestart = () => {
    setInternalTime(actualTimeLimit);
    setCurrentPreviewTime(previewTime);
    setTimePercentage(100);
    if (onRestart) {
      onRestart();
    }
  };
  
  const handleExit = () => {
    window.location.reload();
  };

  // 프리뷰 타이머
  useEffect(() => {
    if (gameStarted && isPreview && currentPreviewTime > 0) {
      const interval = setInterval(() => {
        setCurrentPreviewTime(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameStarted, isPreview, currentPreviewTime]);

  // 게임 타이머 (pauseTimer가 false일 때만 작동, 외부 currentTime이 없을 때만)
  useEffect(() => {
    if (gameStarted && !isPreview && !pauseTimer && currentTime === undefined && internalTime > 0) {
      const interval = setInterval(() => {
        setInternalTime(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameStarted, isPreview, pauseTimer, internalTime, currentTime]);

  // 타임 퍼센티지 계산
  useEffect(() => {
    if (isPreview) {
      setTimePercentage((currentPreviewTime / previewTime) * 100);
    } else {
      setTimePercentage((actualCurrentTime / actualTimeLimit) * 100);
    }
  }, [actualCurrentTime, currentPreviewTime, actualTimeLimit, previewTime, isPreview]);

  // 게임 상태 리셋
  useEffect(() => {
    if (!gameStarted) {
      setInternalTime(actualTimeLimit);
      setCurrentPreviewTime(previewTime);
      setTimePercentage(100);
    }
  }, [gameStarted, actualTimeLimit, previewTime]);
  
  return (
    <div className="game-page">
      {gameStarted && (
        <>
          <div className="small-game-header">
            <div className="header-content">
              {/* 게임이 시작되었을 때만 시간 표시 */}
              <div className="time-display">
                남은 시간: {actualCurrentTime}초
              </div>
            </div>
            <div className="game-controls">
              {/* 게임이 시작되었을 때만 버튼 표시 */}
              {onRestart && (
                <button className="game-control-button restart" onClick={handleRestart}>
                  다시 시작
                </button>
              )}
              <button className="game-control-button exit" onClick={handleExit}>
                나가기
              </button>
            </div>
          </div>
          
          <div className="time-progress-container">
            <div 
              className="time-progress-bar"
              style={{ width: `${timePercentage}%` }}
            />
          </div>
        </>
      )}
      
      <div className="game-content">
        {children}
      </div>
      {gameOver && (
        <GameOverModal 
          open={true} 
          score={score} 
          message={message} 
        />
      )}
    </div>

  );
};

export default GamePage;
