import React, { useState, useEffect } from 'react';
import './MemoryGame.css';
import GamePage from '../GamePage';
import { gameService } from '../../../../services/gameService';
import { GAME_IDS } from '../../gameIds';

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
    time: 120,
    grid: 16,
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼']
  },
  3: {
    time: 120,
    grid: 36,
    emojis: ['⭐', '🌙', '☀️', '⚡', '🌈', '☁️', '❄️', '🌸', '🌺', '🌻', '🌹', '🍀', '🌴', '🌵', '🎄', '🌲', '🌳', '🌾']  }
} as const;

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [timer, setTimer] = useState<number>(levelConfig[1].time);
  const [rewards, setRewards] = useState<Rewards>({
    bronze: false,
    silver: false,
    gold: false
  });
  const [stars, setStars] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [isForceQuit, setIsForceQuit] = useState<boolean>(false);
  const [isPreview, setIsPreview] = useState<boolean>(true);
  const [previewTime, setPreviewTime] = useState<number>(10);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [levelCompleteModal, setLevelCompleteModal] = useState<boolean>(false);
  const [finalGameOverModal, setFinalGameOverModal] = useState<boolean>(false);

  // 타이머 관리
  useEffect(() => {
    let gameTimer: NodeJS.Timeout;
    
    if (gameStarted && !gameOver && !isPreview && timer > 0) {
      gameTimer = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (gameTimer) {
        clearInterval(gameTimer);
      }
    };
  }, [gameStarted, gameOver, isPreview, timer]);

// 프리뷰 타이머 관리
useEffect(() => {
  let previewTimer: NodeJS.Timeout;
  
  if (isPreview && previewTime > 0) {
    previewTimer = setInterval(() => {
      setPreviewTime(prev => {
        if (prev <= 1) {
          setIsPreview(false);
          setCards(prevCards => prevCards.map(card => ({ ...card, isFlipped: false })));
          // 프리뷰가 끝나면 해당 레벨의 시간으로 타이머 초기화
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return () => {
    if (previewTimer) {
      clearInterval(previewTimer);
    }
  };
}, [isPreview, previewTime, currentStage]);

  // 게임 오버 처리와 점수 저장
  useEffect(() => {
    let isUnmounted = false;

    const saveGameScore = async () => {
      // 게임이 완전히 종료된 경우에만 점수 저장 (모든 레벨 클리어 또는 시간 초과)
      if (gameOver && (gameCompleted || finalGameOverModal) && !isUnmounted) {
        try {
          const userId = localStorage.getItem('userId');
          
          if (!userId) {
            console.error('사용자 ID를 찾을 수 없습니다.');
            return;
          }

          let finalScore = 0;
          if (gameCompleted) {
            // 모든 레벨 성공적으로 완료
            finalScore = (currentStage * 10) + (timer * 10) - (moves * 5);
            console.log('게임 완료 - 최종 스테이지:', currentStage);
          } else {
            // 제한시간 초과로 실패
            const completedStage = currentStage - 1;
            finalScore = (completedStage * 100) - (moves * 5);
            console.log('시간 초과 - 완료한 스테이지:', completedStage);
          }
          
          const scoreToSave = Math.max(0, finalScore);
          console.log('저장할 점수:', scoreToSave);
          await gameService.saveGameResult(Number(userId), GAME_IDS.MEMORY_GAME, scoreToSave);
        } catch (error) {
          console.error('게임 결과 저장 중 오류:', error);
        }
      }
    };

    saveGameScore();

    return () => {
      isUnmounted = true;
    };
  }, [gameOver, gameCompleted, finalGameOverModal, currentStage, timer, moves]);

  const handleTimeUp = (): void => {
    setGameStarted(false);
    setIsLocked(true);
    setGameOver(true);
    setFinalGameOverModal(true);
    handleGameEnd(false); // 제한시간 초과로 게임 종료
  };

  const handleGameEnd = async (isSuccess: boolean) => {
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.error('사용자 ID를 찾을 수 없습니다.');
        return;
      }
  
      let finalScore = 0;
      if (isSuccess) {
        // 성공적으로 게임을 완료한 경우
        finalScore = (currentStage * 10) + (timer * 10) - (moves * 5);
      } else {
        // 제한시간 초과로 실패한 경우
        finalScore = ((currentStage - 1) * 100) + (0 * 10) - (moves * 5); // 현재 스테이지 - 1까지만 점수 계산
      }
      
      const scoreToSave = Math.max(0, finalScore);
      await gameService.saveGameResult(Number(userId), GAME_IDS.MEMORY_GAME, scoreToSave);
      console.log('게임 결과 저장 완료 - 점수:', scoreToSave);
    } catch (error) {
      console.error('게임 결과 저장 중 오류:', error);
    }
  };

  const initializeGame = (): void => {
    const stage = currentStage as 1 | 2 | 3;
    const currentLevel = levelConfig[stage];
    
    console.log('Initializing game for stage:', stage);
    
    const emojiSet = [...currentLevel.emojis];
    const pairsNeeded = currentLevel.grid / 2;
    const selectedEmojis = emojiSet.slice(0, pairsNeeded);
    
    const shuffledCards: Card[] = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((content, index) => ({
        id: index,
        content,
        isFlipped: true
      }));
    
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  const handleCardClick = (cardId: number): void => {
    if (isPreview || isLocked || gameOver) return;
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
    if (currentStage < 3) {
      setLevelCompleteModal(true);
      // 중간 단계에서는 gameOver를 true로 설정하지 않음
    } else {
      // 마지막 단계 완료 시에만 게임 오버 및 게임 완료 설정
      setGameCompleted(true);
      setGameOver(true);
    }
  };

  const continueToNextLevel = () => {
    const nextStage = currentStage + 1;
    console.log('Moving to next stage:', nextStage);
    
    const initNextLevel = () => {
      const stage = nextStage as 1 | 2 | 3;
      const currentLevel = levelConfig[stage];
      const emojiSet = [...currentLevel.emojis];
      const pairsNeeded = currentLevel.grid / 2;
      const selectedEmojis = emojiSet.slice(0, pairsNeeded);
      
      const shuffledCards: Card[] = [...selectedEmojis, ...selectedEmojis]
        .sort(() => Math.random() - 0.5)
        .map((content, index) => ({
          id: index,
          content,
          isFlipped: true
        }));
  
      setCurrentStage(stage);
      setCards(shuffledCards);
      setFlipped([]);
      setMatched([]);
      setMoves(0);
      setLevelCompleteModal(false);
      setGameOver(false);
      setIsPreview(true);
      setPreviewTime(10);
      setGameStarted(true);
    };
  
    setGameStarted(false);
    setTimeout(initNextLevel, 100);
  };

  const startGame = (): void => {
    setGameStarted(true);
    setIsPreview(true);
    setPreviewTime(10);
    setGameOver(false);
    initializeGame();
    setTimer(levelConfig[1].time); // 게임 시작 시 타이머 초기화
  };

  const handleRestart = (): void => {
    setGameStarted(false);
    setCards([]);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTimer(levelConfig[1].time);
    setCurrentStage(1);
    setRewards({
      bronze: false,
      silver: false,
      gold: false
    });
    setGameCompleted(false);
    setIsForceQuit(false);
    setGameOver(false);
    setLevelCompleteModal(false);
    setFinalGameOverModal(false);
  };

  const handleQuit = (): void => {
    setGameStarted(false);
    setGameCompleted(true);
    setIsForceQuit(true);
    setGameOver(true);
  };

  return (
    <GamePage 
      title="카드 짝 맞추기" 
      timeLimit={levelConfig[1].time}  // 총 제한시간은 1단계의 120초로 고정
      currentTime={timer}  // 현재 남은 시간
      previewTime={10}
      isPreview={isPreview}
      pauseTimer={levelCompleteModal || finalGameOverModal || gameCompleted}
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
            {levelCompleteModal && (
              <div className="win-message">
                <h2>{currentStage}단계 성공!</h2>
                <p>총 {moves}번 시도하셨습니다.</p>
                <button onClick={continueToNextLevel}>다음 단계로</button>
              </div>
            )}

            {finalGameOverModal && (
              <div className="game-over-message">
                <h2>게임 오버!</h2>
                <p>제한 시간이 종료되었습니다.</p>
                <p>완료한 레벨: {currentStage - 1}</p>
                <p>총 시도 횟수: {moves}</p>
                <button onClick={handleRestart}>다시 시작하기</button>
              </div>
            )}

            {gameCompleted && (
              <div className="win-message">
                <h2>🎉 게임 클리어! 🎉</h2>
                <p>모든 단계를 성공적으로 완료하셨습니다!</p>
                <p>총 시도 횟수: {moves}</p>
                <button onClick={handleRestart}>다시 시작</button>
              </div>
            )}

            {isPreview && (
              <div className="preview-message">
                {previewTime}초 동안 카드를 확인하세요!
              </div>
            )}

            <div className={`card-grid level-${currentStage}`}>
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`card ${card.isFlipped || flipped.includes(card.id) || matched.includes(card.id) ? 'flipped' : ''}`}
                  onClick={() => handleCardClick(card.id)}
                >
                  <div className="card-inner">
                    <div className="card-front">?</div>
                    <div className="card-back">{card.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GamePage>
  );
};

export default MemoryGame;
