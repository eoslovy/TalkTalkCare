import React, { useState, useEffect } from 'react';
import './MemoryGame.css';
import GameComplete from '../GameComplete';
import GamePage from '../GamePage';
import GameMiddleTermModal from '../GameMiddleTermModal.tsx';
import { useNavigate } from 'react-router-dom';

// 카드 뒤집기

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
    time: 100,
    grid: 24,
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐸', '🐯', '🐨', '🦁']
  },
  3: {
    time: 80,
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
  const [showGameOverModal, setShowGameOverModal] = useState(false); // 게임 오버 모달 표시 여부
  const [showMiddleTermModal, setShowMiddleTermModal] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [stageResults, setStageResults] = useState<{ stage: number; timeLeft: number }[]>([]);
  const navigate = useNavigate();


  useEffect(() => {
    if (gameStarted) {
      // 현재 레벨의 시간을 설정
      setTimer(levelConfig[level].time);
      
      // 타이머
      const countdown = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer !== null && prevTimer <= 1) {
            clearInterval(countdown);
            handleTimeUp();
            return 0;
          }
          return prevTimer !== null ? prevTimer - 1 : null;
        });
      }, 1000);
  
      return () => clearInterval(countdown); // 🔥 기존 타이머 정리
    }
  }, [gameStarted, level]); // `level`이 변경될 때도 타이머 초기화

  // 시간 계산
  useEffect(() => {
    if (isPreview && previewTime > 0) {
      const timer = setInterval(() => {
        setPreviewTime(prev => prev - 1);
      }, 1000);
  
      return () => clearInterval(timer);
    } else if (isPreview && previewTime === 0) {
      setIsPreview(false);
      // 모든 카드를 뒤집는 과정 명확하게 수정
      setCards(prev => prev.map(card => ({ ...card, isFlipped: false })));
      setFlipped([]); // 선택된 카드 초기화
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
      setMessage(`시간이 초과되었습니다! ${level}단계까지 성공하셨습니다!`);
      setGameStarted(false);
      setShowGameOverModal(true);
    }
  };

  //카드 생성 로직
  const initializeGame = (): void => {
    const currentLevel = levelConfig[level];
    const neededPairs = Math.floor(currentLevel.grid / 2); // 필요한 쌍 개수
    const selectedEmojis = currentLevel.emojis.slice(0, neededPairs); // 필요한 개수만큼 이모지 선택
    const shuffledCards: Card[] = [...selectedEmojis, ...selectedEmojis]
    .sort(() => Math.random() - 0.5)
    .map((content, index) => ({ 
      id: index, 
      content, 
      isFlipped: true  // 처음에는 모든 카드가 보이도록 설정
      }));
    
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTimer(levelConfig[level].time); // 🔥 새 레벨의 시간으로 timer 설정
    setIsLocked(false); // 락 상태 해제 추가
  };

  useEffect(() => {
    initializeGame();
    setTimer(levelConfig[level].time); // 🔥 새 레벨의 시간으로 timer 설정
  }, [level]); // level이 변경될 때만 initializeGame 호출  

  const handleCardClick = (cardId: number): void => {
    // 프리뷰 중이면 클릭 무시
    if (isPreview) return;
    
    // 기존 검증 로직
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

    // 현재 레벨의 남은 시간을 저장
    setStageResults(prevResults => [
      ...prevResults, 
      { stage: level, timeLeft: timer ?? 0 }
    ]);
      
    if (level < 3) {
      setTimeout(() => {
        setLevel(prev => prev + 1);
        // 다음 레벨 시작 시 프리뷰 모드 재설정
        setIsPreview(true);
        setPreviewTime(10);
      }, 1500);
    } else {
      setGameCompleted(true);
      navigate('/game/complete')
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
            {cards.map((card) => {
              // 카드가 프리뷰 중이거나, 뒤집혔거나, 매치되었는지 확인
              const isCardShown = 
                (isPreview && card.isFlipped) || // 프리뷰 중이면 모든 카드 표시
                (!isPreview && (flipped.includes(card.id) || matched.includes(card.id))); // 게임 중에는 선택되거나 매치된 카드만 표시
              
              return (
                <div
                  key={card.id}
                  className={`card ${isCardShown ? 'flipped' : ''}`}
                  onClick={() => !isPreview && handleCardClick(card.id)} // 프리뷰 중에는 클릭 비활성화
                >
                  <div className="card-inner">
                    <div className="card-front">❔</div>
                    <div className="card-back">{card.content}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {matched.length === cards.length && cards.length > 0 && (
            <div className="win-message">
              <h2>{level}단계를 클리어하셨습니다!</h2>
              <p>총 {moves}번 시도하셨습니다.</p>
            </div>
          )}
        </div>
        )}
      </div>
      <GameMiddleTermModal 
        open={showGameOverModal} 
        message="시간이 종료되었습니다!" 
        stage={level}
        stageResults={stageResults}
        onExit={() => setShowMiddleTermModal(false)}
      />
    </GamePage>
  );
};

export default MemoryGame; 