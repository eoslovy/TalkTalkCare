import React, { useState, useEffect } from 'react';
import './PathFindingGame.css';
import GamePage from '../GamePage';
import { gameService } from '../../../../services/gameService';
import { GAME_IDS } from '../../gameIds';

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
  // 기존 상태 유지
  const [sequence, setSequence] = useState<Direction[]>([]);
  const [userSequence, setUserSequence] = useState<Direction[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showingSequence, setShowingSequence] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 2, y: 2 });
  const [message, setMessage] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [activeButton, setActiveButton] = useState<string | null>(null); // 활성화된 버튼 상태 추가
  const sequenceCancelRef = React.useRef<boolean>(false);

  const directions: Direction[] = [
    { key: '←', value: 'left', icon: '←' },
    { key: '→', value: 'right', icon: '→' },
    { key: '↑', value: 'up', icon: '↑' },
    { key: '↓', value: 'down', icon: '↓' }
  ];
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameStarted && !gameOver) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setMessage('시간이 종료되었습니다!');
            setGameOver(true);  // endGame 직접 호출하지 않고 gameOver 상태만 변경
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

  // 게임 오버 처리를 위한 useEffect
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

          await gameService.saveGameResult(Number(userId), GAME_IDS.THINKING_GAME, score);
          console.log('게임 결과 저장 완료 - 점수:', score);
          setIsPlaying(false);
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
  const resetGame = () => {
    // 모든 게임 상태 초기화
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setGameOver(false);
    setGameStarted(false);
    setIsPlaying(false);
    setShowingSequence(false);
    setMessage('');
    setCurrentPosition({ x: 2, y: 2 });
    setUserSequence([]);
    setSequence([]);
    setActiveButton(null);
  };
  
  const onRestart = async () => {
    // 진행 중인 시퀀스 취소
    sequenceCancelRef.current = true;
    
    // 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 게임 상태 초기화
    resetGame();
    
    // 게임 시작 표시
    setGameStarted(true);
    
    // useEffect에서 새 시퀀스 생성
  };

  const createSequence = (): Direction[] => {
    const length = Math.min(3 + level, 8);
    const newSequence: Direction[] = [];
    let currentPos: Position = { x: 2, y: 2 };
    
    for (let i = 0; i < length; i++) {
      // 가능한 방향들 필터링 - 격자 내에 있는지 확인
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
  
      // 무작위로 다음 방향 선택
      const nextDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
      newSequence.push(nextDirection);
  
      // 선택된 방향에 따라 현재 위치 업데이트
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
    // 시퀀스 시작 시 취소 플래그 초기화
    sequenceCancelRef.current = false;
    
    // 시퀀스 표시 시작
    setShowingSequence(true);
    setUserSequence([]);
    setIsPlaying(false);
    
    // 시작 전에 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 800));
    if (sequenceCancelRef.current) return;
    
    // 중앙에서 시작
    setCurrentPosition({ x: 2, y: 2 });
    let currentPos = { x: 2, y: 2 };
    
    // 각 방향 순차 실행
    for (let i = 0; i < seq.length; i++) {
      // 취소 확인
      if (sequenceCancelRef.current) return;
      
      // 각 방향 전 대기
      await new Promise(resolve => setTimeout(resolve, 400));
      if (sequenceCancelRef.current) return;
      
      // 다음 위치 계산
      const newPos = { ...currentPos };
      switch (seq[i].value) {
        case 'left':
          newPos.x = Math.max(0, currentPos.x - 1);
          break;
        case 'right':
          newPos.x = Math.min(4, currentPos.x + 1);
          break;
        case 'up':
          newPos.y = Math.max(0, currentPos.y - 1);
          break;
        case 'down':
          newPos.y = Math.min(4, currentPos.y + 1);
          break;
      }
      
      // 대각선 이동 방지
      if (newPos.x !== currentPos.x && newPos.y !== currentPos.y) {
        newPos.y = currentPos.y;
      }
      
      // 새 위치로 이동
      currentPos = newPos;
      setCurrentPosition(currentPos);
      
      // 이동 후 대기
      await new Promise(resolve => setTimeout(resolve, 400));
      if (sequenceCancelRef.current) return;
    }
    
    // 모든 시퀀스 표시 후 대기
    await new Promise(resolve => setTimeout(resolve, 400));
    if (sequenceCancelRef.current) return;
    
    // 중앙 위치로 재설정
    setCurrentPosition({ x: 2, y: 2 });
    
    // 플레이어 시작 전 대기
    await new Promise(resolve => setTimeout(resolve, 200));
    if (sequenceCancelRef.current) return;
    
    // 플레이어 차례 시작
    setShowingSequence(false);
    setIsPlaying(true);
  };

  const startGame = async () => {
    resetGame();
    
    setGameStarted(true);
    
  };

  const handleDirectionClick = (direction: Direction): void => {
    if (!isPlaying || showingSequence || gameOver) return;
  
    // 현재 위치에서 새 위치 계산
    const newPos = { ...currentPosition };
    switch (direction.value) {
      case 'left':
        newPos.x = Math.max(0, newPos.x - 1);
        break;
      case 'right':
        newPos.x = Math.min(4, newPos.x + 1);
        break;
      case 'up':
        newPos.y = Math.max(0, newPos.y - 1);
        break;
      case 'down':
        newPos.y = Math.min(4, newPos.y + 1);
        break;
    }
  
    // 격자 내에 있는지 확인
    if (newPos.x < 0 || newPos.x >= 5 || newPos.y < 0 || newPos.y >= 5) {
      return;
    }
  
    // 오직 한 방향(x 또는 y)으로만 이동하도록 보장
    if (newPos.x !== currentPosition.x && newPos.y !== currentPosition.y) {
      newPos.y = currentPosition.y;
    }
  
    const newUserSequence = [...userSequence, direction];
    setUserSequence(newUserSequence);
    setCurrentPosition(newPos);
  
    if (newUserSequence.length === sequence.length) {
      const isCorrect = newUserSequence.every(
        (dir, i) => dir.value === sequence[i].value
      );
  
      if (isCorrect) {
        // 즉시 플레이 중지하고 메시지 표시
        setIsPlaying(false);
        const newScore = score + (level * 10);
        setScore(newScore);
        setLevel(prev => prev + 1);
        setMessage('정답입니다!');
        
        // 정답 확인 후 초기 위치로 돌아간 후 완전히 새 시퀀스를 생성하는 과정을 분리
        setTimeout(() => {
          if (!gameOver) {
            // 초기 위치로 돌아가기
            setCurrentPosition({ x: 2, y: 2 });
            setMessage('');
            
            // 잠시 대기 후 직접 새 시퀀스 생성 - useEffect에 의존하지 않음
            setTimeout(() => {
              if (!gameOver) {
                // 명시적으로 새 시퀀스 생성 및 표시
                const newSeq = createSequence();
                showSequence(newSeq);
              }
            }, 1000); // 초기 위치로 돌아간 후 1초 대기
          }
        }, 1500); // 정답 메시지 1.5초 표시
      } else {
        setMessage('틀렸습니다. 게임이 종료되었습니다.');
        setGameOver(true);
      }
    }
  };

  const handleKeyDown = React.useCallback((event: KeyboardEvent) => {
    if (!isPlaying || showingSequence || gameOver) return;
  
    // 방향키 입력 시 브라우저 스크롤 방지
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      // 브라우저의 기본 스크롤 동작 방지
      event.preventDefault();
      
      let selectedDirection: Direction | undefined;
  
      switch (event.key) {
        case 'ArrowLeft':
          selectedDirection = directions.find(dir => dir.value === 'left');
          setActiveButton('left');
          break;
        case 'ArrowRight':
          selectedDirection = directions.find(dir => dir.value === 'right');
          setActiveButton('right');
          break;
        case 'ArrowUp':
          selectedDirection = directions.find(dir => dir.value === 'up');
          setActiveButton('up');
          break;
        case 'ArrowDown':
          selectedDirection = directions.find(dir => dir.value === 'down');
          setActiveButton('down');
          break;
      }
  
      // 선택된 방향이 있으면 처리
      if (selectedDirection) {
        handleDirectionClick(selectedDirection);
        
        // 키 효과를 잠시 표시한 후 제거 (시각적 피드백용)
        setTimeout(() => {
          setActiveButton(null);
        }, 200);
      }
    }
  }, [isPlaying, showingSequence, gameOver, directions]);

  const handleKeyUp = React.useCallback(() => {
    setActiveButton(null);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);



  useEffect(() => {
    // 게임이 막 시작되었을 때 한 번만 실행되도록 조건 강화
    if (gameStarted && !isPlaying && !showingSequence && !gameOver && 
        userSequence.length === 0 && sequence.length === 0) {
      // 초기 상태에서만 새 시퀀스 생성
      const initializeGame = async () => {
        const newSeq = createSequence();
        await showSequence(newSeq);
      };
      
      initializeGame();
    }
  }, [gameStarted, isPlaying, showingSequence, gameOver, userSequence.length, sequence.length]);

  // 기존 함수들 유지
  
    return (
      <GamePage 
        title="톡톡이의 길찾기"
        onRestart={onRestart} // 여기서 async onRestart 함수를 직접 전달
        gameStarted={gameStarted}
      >
    {/* 나머지 게임 UI 코드는 그대로 유지 */}
        {!gameStarted ? (
          <div className="instructions">
            <h3 className='instructions-title'>게임 방법</h3>
            <p className='instructions-content'>1. 톡톡이가 움직이는 방향을 잘 기억하세요.
            <br />2. 순서대로 방향키를 눌러 톡톡이의 움직임을 따라하세요.
            <br />3. 레벨이 올라갈수록 기억해야 할 방향이 늘어납니다.</p>
            <button onClick={startGame} className='instructions-button'>게임 시작</button>
          </div>
      ) : (
        <div className="">
          <div className="game-info">
            <div className="score">점수: {score}</div>
          </div>

          {gameOver && (
            <div className="game-over-message">
              게임이 종료되었습니다!<br />
              최종 점수: {score}점
            </div>
          )}

          <div className="game-grid">
            {Array(5).fill(null).map((_, y) => (
              <div key={y} className="grid-row">
                {Array(5).fill(null).map((_, x) => (
                  <div 
                    key={x} 
                    className={`grid-cell ${
                      x === currentPosition.x && y === currentPosition.y ? 'active' : ''
                    } ${x === 2 && y === 2 ? 'center-cell' : ''}`}
                  >
                    {x === currentPosition.x && y === currentPosition.y && (
                      <div className="robot">🤖</div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* 이미지 2와 같은 사각형 버튼 레이아웃 */}
          <div className="square-buttons-layout">
            {/* 상단 버튼 - 위쪽 화살표 */}
            <div className="buttons-row top-row">
            <button
              className={`square-button up-button ${activeButton === 'up' ? 'active-button' : ''}`}
              onClick={() => handleDirectionClick(directions[2])}
              disabled={showingSequence || !isPlaying || gameOver}
            >
                {directions[2].icon}
              </button>
            </div>
            
            {/* 하단 버튼 그룹 - 왼쪽, 아래쪽, 오른쪽 화살표 */}
            <div className="buttons-row bottom-row">
            <button
              className={`square-button left-button ${activeButton === 'left' ? 'active-button' : ''}`}
              onClick={() => handleDirectionClick(directions[0])}
              disabled={showingSequence || !isPlaying || gameOver}
            >
              {directions[0].icon}
            </button>
            
            <button
              className={`square-button down-button ${activeButton === 'down' ? 'active-button' : ''}`}
              onClick={() => handleDirectionClick(directions[3])}
              disabled={showingSequence || !isPlaying || gameOver}
            >
              {directions[3].icon}
            </button>
              
            <button
              className={`square-button right-button ${activeButton === 'right' ? 'active-button' : ''}`}
              onClick={() => handleDirectionClick(directions[1])}
              disabled={showingSequence || !isPlaying || gameOver}
            >
              {directions[1].icon}
            </button>
          </div>
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