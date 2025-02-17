import React, { useState, useEffect, useCallback } from 'react';
import './MoleGame.css';
import GamePage from '../GamePage';
import GameOverModal from '../GameOverModal'; // 새로 만든 모달 컴포넌트 import
import { gameService } from '../../../../services/gameService';
import { GAME_IDS } from '../../gameIds';

//두더지 잡기 게임
interface GameState {
  score: number;
  gameStarted: boolean;
  timeLeft: number;
  activeMole: number | null;
  speed: number;
  moles: boolean[];
  gameOver: boolean;
}

const MoleGame: React.FC = () => {
  const [score, setScore] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [activeMole, setActiveMole] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number>(2000);
  const [moles, setMoles] = useState<boolean[]>(Array(9).fill(false));
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isScoreSaved, setIsScoreSaved] = useState<boolean>(false);

  const MOLE_GAME_TIME = 30;

  // 타이머 관리
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameStarted && !gameOver) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Ensure game over state is set with a slight delay to render message
            setTimeout(() => {
              setMessage('시간이 종료되었습니다!');
              setGameOver(true);
            }, 100);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [gameStarted, gameOver]);

  // 게임 오버 처리와 점수 저장 (한 번만 저장)
  useEffect(() => {
    const handleGameOver = async () => {
      if (gameOver && !isScoreSaved) {
        try {
          const userId = localStorage.getItem('userId');
          
          if (!userId) {
            console.error('사용자 ID를 찾을 수 없습니다.');
            return;
          }

          await gameService.saveGameResult(Number(userId), GAME_IDS.QUICKNESS_GAME, score*10);
          console.log('게임 결과 저장 완료 - 점수:', score);
          setIsScoreSaved(true);
          setGameStarted(false);
        } catch (error) {
          console.error('게임 결과 저장 중 오류:', error);
          setMessage('점수 저장에 실패했습니다.');
        }
      }
    };

    handleGameOver();
  }, [gameOver, score, isScoreSaved]);

  const getRandomHole = useCallback((): number => {
    const randomHole = Math.floor(Math.random() * 9);
    return randomHole;
  }, []);

  const showMole = useCallback((): void => {
    if (!gameStarted || gameOver) return;

    const newHole = getRandomHole();
    setMoles(prev => prev.map((mole, idx) => idx === newHole));
    setActiveMole(newHole);

    setTimeout(() => {
      if (gameStarted && !gameOver) {
        setMoles(prev => prev.map(() => false));
        setActiveMole(null);
      }
    }, speed * 0.7);
  }, [gameStarted, gameOver, speed, getRandomHole]);

  useEffect(() => {
    let moleTimer: ReturnType<typeof setInterval>;
    let speedTimer: ReturnType<typeof setInterval>;

    if (gameStarted && !gameOver) {
      moleTimer = setInterval(showMole, speed * 1.5);

      speedTimer = setInterval(() => {
        setSpeed(prev => Math.max(prev * 1.0, 1500));
      }, 5000);
    }

    return () => {
      clearInterval(moleTimer);
      clearInterval(speedTimer);
    };
  }, [gameStarted, gameOver, speed, showMole]);

  const handleMoleClick = (index: number): void => {
    if (!gameStarted || gameOver || index !== activeMole) return;

    setScore(prev => prev + 1);
    setMoles(prev => prev.map(() => false));
    setActiveMole(null);
  };

  const startGame = (): void => {
    setScore(0);
    setTimeLeft(30);
    setSpeed(2000);
    setMoles(Array(9).fill(false));
    setGameOver(false);
    setGameStarted(true);
    setMessage('');
    setIsScoreSaved(false);
  };

  return (
    <>
      <GamePage 
        title="두더지 잡기" 
        timeLimit={timeLeft}
        gameStarted={gameStarted}
        onRestart={startGame}
      >
        <div className="mole-game">
          {!gameStarted ? (
            <div className="instructions">
              <h3>게임 방법</h3>
              <p>1. 두더지를 클릭해서 점수를 얻으세요!</p>
              <p>2. 제한 시간 안에 최대한 많은 점수를 얻으세요.</p>
              <button onClick={startGame}>게임 시작</button>
            </div>
          ) : (
            <>
              <div className="game-info">
                <div className="score">점수: {score*10}</div>
                <div className="time-left">남은 시간: {timeLeft}초</div>
              </div>

              <div className="game-board-mole">
                {moles.map((isActive, index) => (
                  <div 
                    key={index} 
                    className={`hole ${isActive ? 'active' : ''}`}
                    onClick={() => handleMoleClick(index)}
                  >
                    <div className="hole-background"></div>
                    <div className="mole">
                      {isActive && '🦔'}
                    </div>
                  </div>
                ))}
              </div>

              {message && !gameOver && (
                <div className={`message ${message.includes('정답') ? 'correct' : 'wrong'}`}>
                  {message}
                </div>
              )}
            </>
          )}
        </div>
      </GamePage>

      {/* 공통 게임 종료 모달 */}
      <GameOverModal 
        open={gameOver} 
        score={score} 
        message={message || '시간이 종료되었습니다!'}
      />
    </>
  );
};

export default MoleGame;