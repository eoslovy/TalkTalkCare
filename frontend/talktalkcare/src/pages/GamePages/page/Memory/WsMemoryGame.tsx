import React, { useState, useEffect } from 'react';
import './MemoryGame.css';
import GameComplete from '../GameComplete';
import GamePage from '../WsGamePage';
import { sendGameEvent as sendGameEventAPI, GameEvent } from '../../../../services/gameEventService';
import { useWebSocket } from '../../../../contexts/WebSocketContext';

// --- 인터페이스 정의 ---
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

// --- 레벨별 설정 (기존과 동일) ---
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

const WsMemoryGame: React.FC = () => {
  // --- 로컬 상태 (MemoryGame과 동일) ---
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
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [isForceQuit, setIsForceQuit] = useState<boolean>(false);
  const [completedLevel, setCompletedLevel] = useState<number>(0);
  const [isPreview, setIsPreview] = useState<boolean>(true);
  const [previewTime, setPreviewTime] = useState<number>(10);

  const { onGameSelected } = useWebSocket();

  // --- 헬퍼: 웹소켓 이벤트 전송 ---
  const sendEvent = (eventType: string, payload?: any) => {
    const currentUserId = Number(localStorage.getItem('userId'));
    const opponentUserId = Number(localStorage.getItem('opponentUserId'));
    const event: GameEvent = { eventType, senderId: currentUserId, opponentUserId, payload };
    console.log("보내는 이벤트:", event);
    sendGameEventAPI(event);
  };

  // --- 웹소켓 이벤트 수신 (상대방의 액션 반영) ---
  useEffect(() => {
    const localUserId = localStorage.getItem('userId');
    onGameSelected((event: GameEvent) => {
      if (event.senderId.toString() === localUserId) return;
      console.log('상대방으로부터 수신한 이벤트:', event);
      switch (event.eventType) {
        case 'MEMORY_INIT':
          if (event.payload) {
            setLevel(event.payload.level);
            setTimer(event.payload.timer);
            setPreviewTime(event.payload.previewTime);
            setCards(event.payload.cards);
            setIsPreview(event.payload.isPreview);
            setGameStarted(true);  // 추가: 게임 시작 상태 동기화
          }
          break;
        case 'MEMORY_CARD_FLIPPED': {
          const { cardId } = event.payload;
          // 만약 해당 카드가 아직 뒤집히지 않았다면 반영
          if (!flipped.includes(cardId) && !matched.includes(cardId)) {
            setFlipped(prev => [...prev, cardId]);
            // 만약 상대방이 이미 한 장 뒤집어 놓은 상태라면 매칭 로직 실행
            if (flipped.length === 1) {
              const firstCard = cards[flipped[0]];
              const secondCard = cards[cardId];
              if (firstCard && secondCard && firstCard.content === secondCard.content) {
                setMatched(prev => [...prev, flipped[0], cardId]);
                setFlipped([]);
                if (matched.length + 2 === cards.length) {
                  handleLevelComplete();
                }
              } else {
                setTimeout(() => {
                  setFlipped([]);
                }, 1000);
              }
            }
          }
          break;
        }
        case 'MEMORY_LEVEL_COMPLETE':
          setCompletedLevel(event.payload.level);
          if (event.payload.level < 3) {
            setLevel(event.payload.level + 1);
            setIsPreview(true);
            setPreviewTime(10);
            initializeGame();
          } else {
            setGameCompleted(true);
          }
          break;
        case 'MEMORY_GAME_QUIT':
          setGameStarted(false);
          setGameCompleted(true);
          setIsForceQuit(true);
          setCompletedLevel(event.payload.completedLevel);
          break;
        default:
          break;
      }
    });
  // 필요한 상태나 함수가 바뀔 때마다 업데이트 (참고: 상황에 따라 useRef로 최신값 관리 고려)
  }, [flipped, matched, cards, onGameSelected]);

  // --- 타이머 (게임 진행 중) ---
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

  // --- 프리뷰 타이머 ---
  useEffect(() => {
    if (isPreview && previewTime > 0) {
      const previewCountdown = setInterval(() => {
        setPreviewTime(prev => prev - 1);
      }, 1000);
      return () => clearInterval(previewCountdown);
    } else if (isPreview && previewTime === 0) {
      setIsPreview(false);
      // 프리뷰 종료 시 모든 카드를 뒤집음
      setCards(prev => prev.map(card => ({ ...card, isFlipped: false })));
      setFlipped([]);
    }
  }, [isPreview, previewTime]);

  // --- 시간 형식 변환 (UI용) ---
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- 시간 초과 처리 ---
  const handleTimeUp = (): void => {
    setGameStarted(false);
    setIsLocked(true);
    if (matched.length !== cards.length) {
      alert(`시간이 초과되었습니다! ${level}단계까지 성공하셨습니다!`);
    }
  };

  // --- 게임 초기화 (레벨 시작 시) ---
  const initializeGame = (): Card[] => {
    const currentLevel = levelConfig[level];
    const newCards: Card[] = [
      ...currentLevel.emojis.slice(0, currentLevel.grid / 2),
      ...currentLevel.emojis.slice(0, currentLevel.grid / 2)
    ]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({
        id: index,
        content: card,
        isFlipped: true // 프리뷰를 위해 처음엔 모두 뒤집힘
      }));
    setCards(newCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTimer(currentLevel.time);
    setIsLocked(false);
    return newCards;
  };

  // --- 카드 클릭 핸들러 ---
  const handleCardClick = (cardId: number): void => {
    // 프리뷰 중이거나 락 상태이면 무시
    if (isPreview || isLocked) return;
    if (flipped.length === 2) return;
    if (flipped.includes(cardId)) return;
    if (matched.includes(cardId)) return;

    // 로컬 상태 업데이트
    setFlipped([...flipped, cardId]);
    // 상대방에게 카드 선택 이벤트 전송
    sendEvent('MEMORY_CARD_FLIPPED', { cardId });

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

  // --- 레벨 완료 처리 ---
  const handleLevelComplete = (): void => {
    setCompletedLevel(level);
    sendEvent('MEMORY_LEVEL_COMPLETE', { level, moves });
    if (level < 3) {
      setTimeout(() => {
        setLevel(prev => prev + 1);
        setIsPreview(true);
        setPreviewTime(10);
        initializeGame();
      }, 1500);
    } else {
      setGameCompleted(true);
    }
  };

  // --- 게임 재시작 및 종료 ---
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
    sendEvent('MEMORY_GAME_QUIT', { completedLevel: level - 1 });
  };

  // --- 게임 시작 (프리뷰 포함) ---
  const startGame = (): void => {
    setGameStarted(true);
    setIsPreview(true);
    setPreviewTime(10);
    const newCards = initializeGame();
    // 초기 게임 보드 정보를 상대방에게 전송
    sendEvent('MEMORY_INIT', {
      level,
      timer: levelConfig[level].time,
      previewTime: 10,
      cards: newCards,
      isPreview: true
    });
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
            <p className='instructions-content'>
              1. 처음 10초 동안 모든 카드를 확인하세요.
              <br />
              2. 카드가 뒤집히면 짝을 맞춰주세요.
              <br />
              3. 최대한 적은 횟수로 모든 카드의 짝을 찾으세요!
            </p>
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
                // 프리뷰 중이거나, 뒤집혔거나, 매칭된 카드 표시
                const isCardShown = 
                  (isPreview && card.isFlipped) ||
                  (!isPreview && (flipped.includes(card.id) || matched.includes(card.id)));
                return (
                  <div
                    key={card.id}
                    className={`card ${isCardShown ? 'flipped' : ''}`}
                    onClick={() => !isPreview && handleCardClick(card.id)}
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

export default WsMemoryGame;
