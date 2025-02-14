import React, { useState, useEffect } from 'react';
import './ColorWordGame.css';
import GamePage from '../GamePage';

//색깔 단어 읽기 게임
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
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

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

  // 배열을 무작위로 섞는 함수
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
    // 글자의 의미와 색상이 다르게 설정
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

    // 5개의 랜덤한 보기 생성
    let choices: Set<Color> = new Set([colors[meaningIndex], colors[colorIndex]]); // 정답 포함
    while (choices.size < 5) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      choices.add(randomColor);
    }
    
    // Set을 배열로 변환하고 섞기
    const shuffledChoices = shuffleArray(Array.from(choices));

    setCurrentWord(newWord);
    setCurrentChoices(shuffledChoices);

    const questionType = Math.random() < 0.5 ? '가 의미하는' : '의';
    setCurrentQuestion(`이 단어${questionType} 색상을 선택하세요`);
    setMessage('');
    setGameStarted(true);
    setTimeLeft(30);
  };

  const checkAnswer = (selectedColor: string): void => {
    const correctColor = currentQuestion.includes('의미하는') 
      ? currentWord?.meaningColor 
      : currentWord?.textColor;

    if (selectedColor === correctColor) {
      setMessage('정답입니다!');
      setScore(prev => prev + 1);
      setLevel(prev => prev + 1);
    } else {
      setMessage('틀렸습니다!');
      setScore(prev => Math.max(0, prev - 1));
    }

    setTimeout(generateQuestion, 1500);
  };

  return (
    <GamePage 
      title="색깔 단어 읽기"
      timeLimit={timeLeft ?? undefined}
      onRestart={() => {
        setGameStarted(false);
        setScore(0);
        setLevel(1);
        generateQuestion();
      }}
      gameStarted={gameStarted}
    >
      {!gameStarted ? (
        <div className="instructions">
          <h3>게임 방법</h3>
          <p>1. 화면에 나타나는 색깔 단어를 보세요.</p>
          <p>2. 문제가 요구하는 색상(단어가 의미하는 색상 또는 보이는 색상)을 선택하세요.</p>
          <p>3. 올바른 선택을 하면 점수가 올라갑니다.</p>
          <button onClick={generateQuestion}>게임 시작</button>
          {message && <div className="final-score">{message}</div>}
        </div>
      ) : (
        <div className="game-content">
          <div className="game-info">
            <div className="score">점수: {score}</div>
            <div className="level">레벨: {level}</div>
          </div>

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