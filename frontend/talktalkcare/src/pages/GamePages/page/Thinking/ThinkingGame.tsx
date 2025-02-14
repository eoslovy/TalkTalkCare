import React, { useState, useEffect } from 'react';
import './ThinkingGame.css';
import GamePage from '../GamePage';

//가위바위보 게임
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
  const [currentImage, setCurrentImage] = useState<Hand | null>(null);
  const [score, setScore] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [currentCondition, setCurrentCondition] = useState<Condition | null>(null);

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

  const generateQuestion = (): void => {
    const randomIndex = Math.floor(Math.random() * 3);
    const randomCondition = Math.floor(Math.random() * conditions.length);
    setCurrentImage(hands[randomIndex]);
    setCurrentCondition(conditions[randomCondition]);
    setMessage('');
    setGameStarted(true);
  };

  const checkAnswer = (selectedHand: Hand): void => {
    if (!currentImage) return;

    // 가위바위보 승패 로직
    // 0: 무승부, 1: 현재 이미지가 승, 2: 선택한 값이 승
    const result = (currentImage.value - selectedHand.value + 3) % 3;
    let isCorrect = false;

    switch (currentCondition?.id) {
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
      setMessage('정답입니다!');
      setScore(prev => prev + 1);
    } else {
      setMessage('틀렸습니다!');
      setScore(prev => Math.max(0, prev - 1));
    }

    setTimeout(generateQuestion, 1500);
  };

  return (
    <GamePage 
      title="가위바위보 생각하기"
      onRestart={() => {
        setGameStarted(false);
        setScore(0);
        generateQuestion();
      }}
      gameStarted={gameStarted}
    >
     {gameStarted ? (
  <div className="game-container">
    <div className="top-container">
      <div className="condition">
        {currentCondition?.text}
      </div>
      <div className="score">점수: {score}</div>
    </div>

    <div className="image-container">
      <div className="current-image">
        <div className="image-display">
          {currentImage?.image}
        </div>
        <p>현재 이미지</p>
      </div>

      <div className="choices">
        {hands.map((hand) => (
          <button
            key={hand.name}
            className="choice-button"
            onClick={() => checkAnswer(hand)}
          >
            <div className="hand-image">{hand.image}</div>
            <div className="hand-name">{hand.name}</div>
          </button>
        ))}
      </div>
    </div>

    {message && (
      <div className={`message ${message.includes('정답') ? 'correct' : 'wrong'}`}>
        {message}
      </div>
    )}
  </div>
) : (
  <div className="instructions">
    <h3>게임 방법</h3>
    <p>1. 화면에 표시되는 가위바위보 이미지를 보세요.</p>
    <p>2. 주어진 조건에 맞는 선택을 하세요.</p>
    <p>3. 올바른 선택을 하면 점수가 올라갑니다.</p>
    <button onClick={generateQuestion}>게임 시작</button>
  </div>
)}
    </GamePage>
  );
}


export default ThinkingGame; 