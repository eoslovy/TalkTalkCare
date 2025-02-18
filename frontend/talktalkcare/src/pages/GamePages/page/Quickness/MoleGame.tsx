import React, { useState, useEffect, useCallback } from 'react';
import './MoleGame.css';
import GamePage from '../GamePage';

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
  const [speed, setSpeed] = useState<number>(1000);
  const [moles, setMoles] = useState<boolean[]>(Array(9).fill(false));
  const [gameOver, setGameOver] = useState<boolean>(false);
  const MOLE_GAME_TIME = 30; // 두더지 게임의 기본 시간

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
    }, speed * 0.9);
  }, [gameStarted, gameOver, speed, getRandomHole]);

  useEffect(() => {
    let moleTimer: ReturnType<typeof setTimeout>;
    let speedTimer: ReturnType<typeof setTimeout>;
    let gameTimer: ReturnType<typeof setTimeout>;

    if (gameStarted && !gameOver) {
      moleTimer = setInterval(showMole, speed);

      speedTimer = setInterval(() => {
        setSpeed(prev => Math.max(prev * 0.95, 600));
      }, 5000);

      gameTimer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(moleTimer);
      clearInterval(speedTimer);
      clearInterval(gameTimer);
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
    setSpeed(1000);
    setMoles(Array(9).fill(false));
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <GamePage 
      title="두더지 잡기" 
      timeLimit={MOLE_GAME_TIME}
      gameStarted={gameStarted}
      onRestart={startGame}
    >
      <div className="mole-game">
        {!gameStarted ? (
          <div className="instructions">
            <h3 className='instructions-title'>게임 방법</h3>
            <p className='instructions-content'>1. 두더지를 클릭해서 점수를 얻으세요!
            <br />2. 제한 시간 안에 최대한 많은 점수를 얻으세요.</p>
            <button onClick={() => setGameStarted(true)} className='instructions-button'>게임 시작</button>
          </div>
        ) : (
          <>
            <div className="game-info">
              <div className="score">점수: {score}</div>
            </div>
            <div className="mole-game-board">
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
          </>
        )}
      </div>
    </GamePage>
  );
};

export default MoleGame; 