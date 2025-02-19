import React, { useState, useCallback, useEffect } from 'react';
import './ThinkingGame.css';
import GamePage from '../GamePage';
import { gameService } from '../../../../services/gameService';
import { GAME_IDS } from '../../gameIds';

interface Hand {
  name: string;
  value: number;
  image: string;
}

interface Condition {
  id: number;
  text: string;
}

const ThinkingGame: React.FC = () => {
  const TOTAL_TIME = 60;
  const [currentImage, setCurrentImage] = useState<Hand | null>(null);
  const [score, setScore] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [currentCondition, setCurrentCondition] = useState<Condition | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME);
  const [selectedButtonIndex, setSelectedButtonIndex] = useState<number>(0);

  const hands: Hand[] = [
    { name: '가위', value: 0, image: '✌️' },
    { name: '바위', value: 1, image: '✊' },
    { name: '보', value: 2, image: '✋' }
  ];

  const conditions: Condition[] = [
    { id: 0, text: '이기는 경우를 선택하세요' },
    { id: 1, text: '지는 경우를 선택하세요' },
    { id: 2, text: '비기는 경우를 선택하세요' },
    { id: 3, text: '이기지도 않고 비기지도 않는 경우를 선택하세요' },
    { id: 4, text: '지지도 않고 비기지도 않는 경우를 선택하세요' },
    { id: 5, text: '이기지도 않고 지지도 않는 경우를 선택하세요' }
  ];

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(TOTAL_TIME);
    setGameOver(false);
    setMessage('');
    setSelectedButtonIndex(0);
    setGameStarted(true);
    generateQuestion();
  }, []);

  const generateQuestion = useCallback((): void => {
    if (gameOver) return;
    
    const randomImage = hands[Math.floor(Math.random() * hands.length)];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    setCurrentImage(randomImage);
    setCurrentCondition(randomCondition);
    setMessage('');
  }, [gameOver, hands, conditions]);

  const checkAnswer = useCallback((selectedHand: Hand): void => {
    if (!currentImage || !currentCondition || gameOver) return;

    const result = (currentImage.value - selectedHand.value + 3) % 3;
    let isCorrect = false;

    switch (currentCondition.id) {
      case 0: // 이기는 경우
        isCorrect = result === 2;
        break;
      case 1: // 지는 경우
        isCorrect = result === 1;
        break;
      case 2: // 비기는 경우
        isCorrect = result === 0;
        break;
      case 3: // 이기지도 않고 비기지도 않는 경우
        isCorrect = result === 1;
        break;
      case 4: // 지지도 않고 비기지도 않는 경우
        isCorrect = result === 2;
        break;
      case 5: // 이기지도 않고 지지도 않는 경우
        isCorrect = result === 0;
        break;
    }

    if (isCorrect) {
      setScore(prev => prev + 1);
      generateQuestion(); // 다음 문제 생성을 위해 함수 호출
    } else {
      setMessage('틀렸습니다. 게임이 종료되었습니다.');
      setGameOver(true);
    }
  }, [currentImage, currentCondition, gameOver, generateQuestion]);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!gameStarted || gameOver) return;

    switch (event.key) {
      case 'ArrowRight':
        setSelectedButtonIndex(prev => (prev + 1) % hands.length);
        break;
      case 'ArrowLeft':
        setSelectedButtonIndex(prev => (prev - 1 + hands.length) % hands.length);
        break;
      case 'Enter':
      case ' ':
        // 현재 선택된 손 선택
        checkAnswer(hands[selectedButtonIndex]);
        break;
    }
  }, [gameStarted, gameOver, selectedButtonIndex, hands, checkAnswer]);

  // 키보드 이벤트 리스너 추가
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 게임 오버 처리를 위한 useEffect
  useEffect(() => {
    const saveGameScore = async () => {
      if (gameOver) {
        try {
          const userId = localStorage.getItem('userId');
          
          if (!userId) {
            console.error('사용자 ID를 찾을 수 없습니다.');
            return;
          }

          await gameService.saveGameResult(Number(userId), GAME_IDS.THINKING_GAME, score*10);
          console.log('게임 결과 저장 완료 - 점수:', score);
        } catch (error) {
          console.error('게임 결과 저장 중 오류:', error);
          setMessage('점수 저장에 실패했습니다.');
        }
      }
    };

    saveGameScore();
  }, [gameOver, score]);

  // 시간 관리
  useEffect(() => {
    if (timeLeft <= 0 && gameStarted && !gameOver) {
      setMessage('시간이 종료되었습니다!');
      setGameOver(true);
    }
  }, [timeLeft, gameStarted, gameOver]);

  // 타이머 감소 관리
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameStarted && !gameOver) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [gameStarted, gameOver]);

  return (
    <GamePage 
      title="가위바위보 생각하기"
      timeLimit={TOTAL_TIME}
      currentTime={timeLeft}
      onRestart={startGame}
      gameStarted={gameStarted}
      gameOver={gameOver}
      score={score}
      message={gameOver ? (message || '시간이 종료되었습니다!') : ''}
    >
      {!gameStarted ? (
        <div className="instructions">
          <h3 className='instructions-title'>게임 방법</h3>
          <p className='instructions-content'>
            1. 화면에 표시되는 가위바위보 이미지를 보세요.
            <br />2. 주어진 조건에 맞는 선택을 하세요.
            <br />3. 올바른 선택을 하면 점수가 올라갑니다.
          </p>
          <button onClick={startGame} className='instructions-button'>게임 시작</button>
        </div>
      ) : (
        <div className="think-game-container">
          <div className="top-container">
            <div className="condition">
              <h3 style={{ fontSize: '16px' }}>문제:</h3>
              <p style={{ fontSize: '14px' }}>{currentCondition?.text || '문제 로딩 중...'}</p>
            </div>
            <div className="game-info">
              <div className="score">점수: {score}</div>
            </div>
          </div>

          <div className="current-image">
            <div className="image-display">
              {currentImage?.image || ''}
            </div>
            <p style={{ fontSize: '14px' }}>현재 이미지</p>
          </div>

          <div className="choices">
            {hands.map((hand, index) => (
              <button
                key={hand.name}
                className={`choice-button ${index === selectedButtonIndex ? 'selected' : ''}`}
                onClick={() => checkAnswer(hand)}
                disabled={gameOver}
              >
                <div className="hand-image">{hand.image}</div>
                <div className="hand-name">{hand.name}</div>
              </button>
            ))}
          </div>

          {message && (
            <div className={`message ${message.includes('정답') ? 'correct' : 'wrong'}`}>
              {message}
            </div>
          )}
        </div>
      )}
    </GamePage>
  );
};

export default ThinkingGame;