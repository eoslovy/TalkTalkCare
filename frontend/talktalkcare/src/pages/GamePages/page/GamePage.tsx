import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/GamePage.css';

interface GamePageProps {
  title: string;
  timeLimit?: number;
  children: React.ReactNode;
  onRestart?: () => void;
  gameStarted?: boolean;
}

const DEFAULT_TIME_LIMIT = 60;

const GamePage: React.FC<GamePageProps> = ({ 
  title, 
  timeLimit, 
  children, 
  onRestart,
  gameStarted = false 
}) => {
  const navigate = useNavigate();
  const actualTimeLimit = timeLimit || DEFAULT_TIME_LIMIT;
  const [currentTime, setCurrentTime] = useState(actualTimeLimit);
  const [timePercentage, setTimePercentage] = useState(100);

  const handleRestart = () => {
    setCurrentTime(actualTimeLimit);
    setTimePercentage(100);
    if (onRestart) {
      onRestart();
    }
  };
  
  const handleExit = () => {
    navigate('/game');  // 목록 페이지로 이동
  };

  useEffect(() => {
    if (gameStarted && currentTime > 0) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameStarted, currentTime]);

  useEffect(() => {
    setTimePercentage((currentTime / actualTimeLimit) * 100);
  }, [currentTime, actualTimeLimit]);

  useEffect(() => {
    if (!gameStarted) {
      setCurrentTime(actualTimeLimit);
      setTimePercentage(100);
    }
  }, [gameStarted, actualTimeLimit]);

  return (
    <div className="game-page">
      {gameStarted && (
        <>
          <div className="small-game-header">
            <div className="header-content">
              {/* 게임이 시작되었을 때만 시간 표시 */}
              <div className="time-display">
                남은 시간: {currentTime}초
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
    </div>

  );
};

export default GamePage;
