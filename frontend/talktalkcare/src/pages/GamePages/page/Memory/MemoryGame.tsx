import React, { useState, useEffect } from 'react';
import './MemoryGame.css';
import goldBrain from '../assets/goldbrain.png';
import silverBrain from '../assets/silverbrain.png';
import bronzeBrain from '../assets/bronzebrain.png';
import GameComplete from '../GameComplete';
import GamePage from '../GamePage';

//기억력게임

interface Card {
  id: number;
  content: string;
  isFlipped: boolean;
}

interface LevelConfig {
  time: number;
  grid: number;
  emojis: string[];
}

interface Rewards {
  bronze: boolean;
  silver: boolean;
  gold: boolean;
}

interface LevelConfigs {
  [key: number]: LevelConfig;
}

const levelConfig: LevelConfigs = {
  1: {
    time: 120,
    grid: 16,
    emojis: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝']
  },
  2: {
    time: 90,
    grid: 16,
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼']
  },
  3: {
    time: 60,
    grid: 36,
    emojis: ['⭐', '🌙', '☀️', '⚡', '🌈', '☁️', '❄️', '🌸', '🌺', '🌻', '🌹', '🍀', '🌴', '🌵', '🎄', '🌲', '🌳', '🌾']
  }
};

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(1);
  const [timer, setTimer] = useState<number | null>(null);
  const [rewards, setRewards] = useState<Rewards>({
    bronze: false,
    silver: false,
    gold: false
  });
  const [stars, setStars] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [isForceQuit, setIsForceQuit] = useState<boolean>(false);
  const [completedLevel, setCompletedLevel] = useState<number>(0);
  const [isPreview, setIsPreview] = useState<boolean>(true);
  const [previewTime, setPreviewTime] = useState<number>(10);

  useEffect(() => {
    if (gameStarted && timer !== null && timer > 0) {
      const countdown = setInterval(() => {
        setTimer(prev => {
          if (prev !== null && prev <= 1) {
            clearInterval(countdown);
            handleTimeUp();
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [gameStarted, timer]);

  useEffect(() => {
    if (isPreview && previewTime > 0) {
      const timer = setInterval(() => {
        setPreviewTime(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (isPreview && previewTime === 0) {
      setIsPreview(false);
      setCards(prev => prev.map(card => ({ ...card, isFlipped: false })));
    }
  }, [isPreview, previewTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUp = (): void => {
    setGameStarted(false);
    setIsLocked(true);
    if (matched.length !== cards.length) {
      alert(`시간이 초과되었습니다! ${level}단계까지 성공하셨습니다!`);
      setGameStarted(false);
    }
  };

  const initializeGame = (): void => {
    const currentLevel = levelConfig[level];
    const shuffledCards: Card[] = [...currentLevel.emojis.slice(0, currentLevel.grid/2), 
                          ...currentLevel.emojis.slice(0, currentLevel.grid/2)]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ 
        id: index, 
        content: card, 
        isFlipped: true  // 처음에는 모든 카드가 보이도록 설정
      }));
    
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTimer(currentLevel.time);
  };

  const handleCardClick = (cardId: number): void => {
    if (isLocked) return;
    if (flipped.length === 2) return;
    if (flipped.includes(cardId)) return;
    if (matched.includes(cardId)) return;

    setFlipped([...flipped, cardId]);

    if (flipped.length === 1) {
      setIsLocked(true);
      setMoves(prev => prev + 1);
      
      const firstCard = cards[flipped[0]];
      const secondCard = cards[cardId];

      if (firstCard.content === secondCard.content) {
        setMatched([...matched, flipped[0], cardId]);
        setFlipped([]);
        setIsLocked(false);

        if (matched.length + 2 === cards.length) {
          handleLevelComplete();
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const handleLevelComplete = (): void => {
    setCompletedLevel(level);
    
    if (level < 3) {
      setTimeout(() => {
        setLevel(prev => prev + 1);
        initializeGame();
      }, 1500);
    } else {
      setGameCompleted(true);
    }
  };

  const isCardFlipped = (cardId: number): boolean => {
    return flipped.includes(cardId) || matched.includes(cardId);
  };

  const handleRestart = (): void => {
    setGameStarted(false);
    setCards([]);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTimer(levelConfig[1].time);
    setLevel(1);
    setCompletedLevel(0);
    setRewards({
      bronze: false,
      silver: false,
      gold: false
    });
    setGameCompleted(false);
    setIsForceQuit(false);
  };

  const handleQuit = (): void => {
    setGameStarted(false);
    setGameCompleted(true);
    setIsForceQuit(true);
    setCompletedLevel(level - 1);
  };

  const startGame = (): void => {
    setGameStarted(true);  // 게임 시작 상태를 먼저 설정
    setIsPreview(true);
    setPreviewTime(10);
    initializeGame();
  };

  return (
    <GamePage 
      title="카드 짝 맞추기" 
      timeLimit={levelConfig[level].time}
      onRestart={handleRestart}
      gameStarted={gameStarted}
    >
      <div className="memory-game">
        {!gameStarted ? (
          <div className="instructions">
            <h3 className='instructions-title'>게임 방법</h3>
            <p className='.instructions-content'>1. 처음 10초 동안 모든 카드를 확인하세요.
            <br />2. 카드가 뒤집히면 짝을 맞춰주세요.
            <br />3. 최대한 적은 횟수로 모든 카드의 짝을 찾으세요!</p>
            <button onClick={startGame} className='instructions-button'>게임 시작</button>
          </div>
        ) : (
          <div className="game-board">
            {isPreview && (
              <div className="preview-message">
                {previewTime}초 동안 카드를 확인하세요!
              </div>
            )}
            <div className={`card-grid level-${level}`}>
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`card ${card.isFlipped || isCardFlipped(card.id) ? 'flipped' : ''}`}
                  onClick={() => handleCardClick(card.id)}
                >
                  <div className="card-inner">
                    <div className="card-front">?</div>
                    <div className="card-back">{card.content}</div>
                  </div>
                </div>
              ))}
            </div>
            {matched.length === cards.length && (
              <div className="win-message">
                <h2>축하합니다! {level}단계를 클리어하셨습니다!</h2>
                <p>총 {moves}번 시도하셨습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </GamePage>
  );
};

export default MemoryGame; 