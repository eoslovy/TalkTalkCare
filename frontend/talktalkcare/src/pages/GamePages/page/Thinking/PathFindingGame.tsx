import React, { useState, useEffect } from 'react';
import './PathFindingGame.css';
import GamePage from '../GamePage';

//똑똑이 방향 찾기 게임
interface Direction {
  key: string;
  value: 'left' | 'right' | 'up' | 'down';
  icon: string;
}

interface Position {
  x: number;
  y: number;
}

const PathFindingGame: React.FC = () => {
  const [sequence, setSequence] = useState<Direction[]>([]);
  const [userSequence, setUserSequence] = useState<Direction[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showingSequence, setShowingSequence] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 2, y: 2 });
  const [message, setMessage] = useState<string>('');

  const directions: Direction[] = [
    { key: '←', value: 'left', icon: '←' },
    { key: '→', value: 'right', icon: '→' },
    { key: '↑', value: 'up', icon: '↑' },
    { key: '↓', value: 'down', icon: '↓' }
  ];

  const createSequence = (): Direction[] => {
    const length = Math.min(3 + level, 8);
    const newSequence: Direction[] = [];
    let currentPos: Position = { x: 2, y: 2 };
    
    for (let i = 0; i < length; i++) {
      const possibleDirections = directions.filter(dir => {
        const newPos = { ...currentPos };
        switch (dir.value) {
          case 'left':
            newPos.x -= 1;
            break;
          case 'right':
            newPos.x += 1;
            break;
          case 'up':
            newPos.y -= 1;
            break;
          case 'down':
            newPos.y += 1;
            break;
        }
        return newPos.x >= 0 && newPos.x < 5 && newPos.y >= 0 && newPos.y < 5;
      });

      const nextDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
      newSequence.push(nextDirection);

      switch (nextDirection.value) {
        case 'left':
          currentPos.x -= 1;
          break;
        case 'right':
          currentPos.x += 1;
          break;
        case 'up':
          currentPos.y -= 1;
          break;
        case 'down':
          currentPos.y += 1;
          break;
      }
    }
    
    setSequence(newSequence);
    return newSequence;
  };

  const showSequence = async (seq: Direction[]): Promise<void> => {
    setShowingSequence(true);
    setUserSequence([]);
    
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentPosition(prev => {
        const newPos = { ...prev };
        switch (seq[i].value) {
          case 'left':
            newPos.x = Math.max(0, prev.x - 1);
            break;
          case 'right':
            newPos.x = Math.min(4, prev.x + 1);
            break;
          case 'up':
            newPos.y = Math.max(0, prev.y - 1);
            break;
          case 'down':
            newPos.y = Math.min(4, prev.y + 1);
            break;
        }
        return newPos;
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowingSequence(false);
    setCurrentPosition({ x: 2, y: 2 });
    setIsPlaying(true);
  };

  const handleDirectionClick = (direction: Direction): void => {
    if (!isPlaying || showingSequence) return;

    const newPos = { ...currentPosition };
    switch (direction.value) {
      case 'left':
        newPos.x = newPos.x - 1;
        break;
      case 'right':
        newPos.x = newPos.x + 1;
        break;
      case 'up':
        newPos.y = newPos.y - 1;
        break;
      case 'down':
        newPos.y = newPos.y + 1;
        break;
    }

    if (newPos.x < 0 || newPos.x >= 5 || newPos.y < 0 || newPos.y >= 5) {
      return;
    }

    const newUserSequence = [...userSequence, direction];
    setUserSequence(newUserSequence);
    setCurrentPosition(newPos);

    if (newUserSequence.length === sequence.length) {
      const isCorrect = newUserSequence.every(
        (dir, i) => dir.value === sequence[i].value
      );

      if (isCorrect) {
        setScore(score + (level * 10));
        setLevel(level + 1);
        setMessage('정답입니다!');
        setIsPlaying(false);
        setTimeout(() => {
          setMessage('');
          setCurrentPosition({ x: 2, y: 2 });
          const newSeq = createSequence();
          showSequence(newSeq);
        }, 1500);
      } else {
        setMessage('틀렸습니다. 다시 시도하세요.');
        setIsPlaying(false);
        setTimeout(() => {
          setMessage('');
          setCurrentPosition({ x: 2, y: 2 });
          showSequence(sequence);
        }, 1500);
      }
    }
  };

  useEffect(() => {
    if (gameStarted && !isPlaying && !showingSequence) {
      const newSeq = createSequence();
      showSequence(newSeq);
    }
  }, [gameStarted]);

  return (
    <GamePage 
      title="톡톡이의 길찾기"
      onRestart={() => {
        setGameStarted(false);
        setScore(0);
        setLevel(1);
      }}
      gameStarted={gameStarted}
    >
      {!gameStarted ? (
        <div className="instructions">
          <h3>게임 방법</h3>
          <p>1. 톡톡이가 움직이는 방향을 잘 기억하세요.</p>
          <p>2. 순서대로 방향키를 눌러 톡톡이의 움직임을 따라하세요.</p>
          <p>3. 레벨이 올라갈수록 기억해야 할 방향이 늘어납니다.</p>
          <button onClick={() => setGameStarted(true)}>게임 시작</button>
        </div>
      ) : (
        <div className="game-content">
          <div className="game-info">
            <div className="score">점수: {score}</div>
            <div className="level">레벨: {level}</div>
          </div>

          <div className="game-grid">
            {Array(5).fill(null).map((_, y) => (
              <div key={y} className="grid-row">
                {Array(5).fill(null).map((_, x) => (
                  <div 
                    key={x} 
                    className={`grid-cell ${
                      x === currentPosition.x && y === currentPosition.y ? 'active' : ''
                    }`}
                  >
                    {x === currentPosition.x && y === currentPosition.y && (
                      <div className="robot">🤖</div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="controls">
            {directions.map((dir) => (
              <button
                key={dir.key}
                onClick={() => handleDirectionClick(dir)}
                disabled={showingSequence || !isPlaying}
              >
                {dir.icon}
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

export default PathFindingGame;