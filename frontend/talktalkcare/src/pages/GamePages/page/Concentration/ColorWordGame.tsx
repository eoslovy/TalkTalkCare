import React, { useState, useEffect } from 'react';
import './ColorWordGame.css';
import GamePage from '../GamePage';
import GameOverModal from '../GameOverModal'; // GameOverModal 컴포넌트를 임포트
import { gameService } from '../../../../services/gameService';
import { GAME_IDS } from '../../gameIds';

interface Color {
  name: string;
  code: string;
}

interface Word {
  text: string;
  textColor: string;
  meaningColor: string;
}

const ColorWordGame: React.FC = () => {
  const [score, setScore] = useState<number>(0);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [message, setMessage] = useState<string>('');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentChoices, setCurrentChoices] = useState<Color[]>([]);
  const [level, setLevel] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const colors: Color[] = [
    { name: '빨강', code: '#FF0000' },
    { name: '파랑', code: '#0000FF' },
    { name: '초록', code: '#008000' },
    { name: '노랑', code: '#FFD700' },
    { name: '보라', code: '#800080' },
    { name: '주황', code: '#FFA500' },
    { name: '분홍', code: '#FF69B4' },
    { name: '갈색', code: '#8B4513' },
    { name: '하늘', code: '#87CEEB' },
    { name: '회색', code: '#808080' }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameStarted && !gameOver) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setMessage('시간이 종료되었습니다!');
            setGameOver(true);
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

  useEffect(() => {
    const timerBar = document.querySelector('.timer-progress') as HTMLElement;
    if (timerBar && timeLeft >= 0) {
      timerBar.style.width = `${(timeLeft / 60) * 100}%`;
      
      // 남은 시간에 따라 색상 변경
      if (timeLeft > 40) {
        timerBar.style.backgroundColor = '#4CAF50'; // 녹색
      } else if (timeLeft > 20) {
        timerBar.style.backgroundColor = '#FFC107'; // 노란색
      } else {
        timerBar.style.backgroundColor = '#FF5722'; // 빨간색
      }
    }
  }, [timeLeft]);

  // 게임 오버 처리와 점수 저장
  useEffect(() => {
    let isUnmounted = false;

    const handleGameOver = async () => {
      if (gameOver && !isUnmounted) {
        try {
          const userId = localStorage.getItem('userId');
          
          if (!userId) {
            console.error('사용자 ID를 찾을 수 없습니다.');
            return;
          }

          await gameService.saveGameResult(Number(userId), GAME_IDS.CONCENTRATION_GAME, score*10);
          console.log('게임 결과 저장 완료 - 점수:', score*10);
          setGameStarted(false);
        } catch (error) {
          console.error('게임 결과 저장 중 오류:', error);
          setMessage('점수 저장에 실패했습니다.');
        }
      }
    };

    handleGameOver();

    return () => {
      isUnmounted = true;
    };
  }, [gameOver, score]);

  const shuffleArray = (array: Color[]): Color[] => {
    let currentIndex = array.length;
    let temporaryValue: Color, randomIndex: number;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };

  const generateQuestion = (): void => {
    if (gameOver) return;

    let meaningIndex: number, colorIndex: number;
    do {
      meaningIndex = Math.floor(Math.random() * colors.length);
      colorIndex = Math.floor(Math.random() * colors.length);
    } while (meaningIndex === colorIndex);

    const newWord: Word = {
      text: colors[meaningIndex].name,
      textColor: colors[colorIndex].code,
      meaningColor: colors[meaningIndex].code
    };

    let choices: Set<Color> = new Set([colors[meaningIndex], colors[colorIndex]]);
    while (choices.size < 5) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      choices.add(randomColor);
    }
    
    const shuffledChoices = shuffleArray(Array.from(choices));

    setCurrentWord(newWord);
    setCurrentChoices(shuffledChoices);
    setCurrentQuestion(`이 단어${Math.random() < 0.5 ? '가 의미하는' : '의'} 색상을 선택하세요`);
    setMessage('');
    setGameStarted(true);
  };

  // startGame 함수 수정
  const startGame = async () => {
    setScore(0);
    setLevel(1);
    setTimeLeft(60);  
    setGameOver(false);
    setGameStarted(true);
    setMessage('');
    generateQuestion();
  };

  const checkAnswer = (selectedColor: string): void => {
    if (gameOver) return;

    const correctColor = currentQuestion.includes('의미하는') 
      ? currentWord?.meaningColor 
      : currentWord?.textColor;

    if (selectedColor === correctColor) {
      const newScore = score + 1;
      setScore(newScore);
      setLevel(prev => prev + 1);
      generateQuestion();
    } else {
      setMessage('틀렸습니다. 게임이 종료되었습니다.');
      setGameOver(true);
    }
  };

  return (
    <GamePage 
      title="색깔 단어 읽기"
      // timeLimit={timeLeft ?? undefined}
      onRestart={() => {
        setGameStarted(false);
        setScore(0);
        setLevel(1);
        generateQuestion();
      }}
      gameStarted={gameStarted}
      gameOver={gameOver}
      score={score}
    >
      {!gameStarted && !gameOver ? ( // 게임 시작 전이면서 게임 오버가 아닐 때만 시작 화면 표시
        <div className="instructions">
          <h3 className='instructions-title'>게임 방법</h3>
          <p className='.instructions-content'>1. 화면에 나타나는 색깔 단어를 보세요.
          <br />2. 문제가 요구하는 색상(단어가 의미하는 색상 또는 보이는 색상)을 선택하세요.
          <br />3. 올바른 선택을 하면 점수가 올라갑니다.</p>
          <button onClick={generateQuestion} className='instructions-button'>게임 시작</button>
          {message && <div className="final-score">{message}</div>}
        </div>
      ) : (
        <div className="">
          <div className="game-info">
            <div className="score">점수: {score}</div>
            <div className="level">레벨: {level}</div>
          </div>
  
          {gameOver && (
            <div className="game-over-message">
              게임이 종료되었습니다!<br />
              최종 점수: {score}점
            </div>
          )}
     
          <div className="question">
            <h3>{currentQuestion}</h3>
          </div>
     
          <div 
            className="word-display"
            style={{
              color: currentWord?.textColor
            }}
          >
            {currentWord?.text}
          </div>
     
          <div className="color-choices">
            {currentChoices.map((color) => (
              <button
                key={color.code}
                className="color-button"
                style={{ backgroundColor: color.code }}
                onClick={() => checkAnswer(color.code)}
                disabled={gameOver}
              />
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

export default ColorWordGame;
