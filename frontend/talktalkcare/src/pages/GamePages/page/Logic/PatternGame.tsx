import React, { useState, useEffect } from 'react';
import './PatternGame.css';
import GamePage from '../GamePage';
import GameMiddleTermModal from '../GameMiddleTermModal.tsx';
import { gameService } from '../../../../services/gameService';
import { GAME_IDS } from '../../gameIds';
import { useNavigate } from 'react-router-dom'; // 🔥 네비게이션 훅 추가

interface Pattern {
  generate: (start: number) => {
    sequence: number[];
    isValid: boolean;
  };
  description: string;
}

interface CurrentPattern {
  answer: number;
  description: string;
}

const PatternGame: React.FC = () => {
  const [sequence, setSequence] = useState<(number | string)[]>([]);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [currentPattern, setCurrentPattern] = useState<CurrentPattern | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false); // 게임 오버 모달 표시 여부
  const [showMiddleTermModal, setShowMiddleTermModal] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState(0); // 정답 맞힌 횟수 추가
  const [stageResults, setStageResults] = useState<{ stage: number; timeLeft: number }[]>([]);
  const navigate = useNavigate(); // 🔥 네비게이션 인스턴스 생성


  const patterns: Pattern[] = [
    {
      generate: (start) => {
        if (start + 6 > 12) return { sequence: [], isValid: false };
        const seq = [start];
        for(let i = 0; i < 3; i++) {
          seq.push(seq[seq.length - 1] + 2);
        }
        return { sequence: seq, isValid: true };
      },
      description: '+2씩 증가'
    },
    {
      generate: (start) => {
        if (start - 6 < 1) return { sequence: [], isValid: false };
        const seq = [start];
        for(let i = 0; i < 3; i++) {
          seq.push(seq[seq.length - 1] - 2);
        }
        return { sequence: seq, isValid: true };
      },
      description: '-2씩 감소'
    },
    {
      generate: (start) => {
        if (start + 9 > 12) return { sequence: [], isValid: false };
        const seq = [start];
        for(let i = 0; i < 3; i++) {
          seq.push(seq[seq.length - 1] + 3);
        }
        return { sequence: seq, isValid: true };
      },
      description: '+3씩 증가'
    },
    {
      generate: (start) => {
        if (start - 9 < 1) return { sequence: [], isValid: false };
        const seq = [start];
        for(let i = 0; i < 3; i++) {
          seq.push(seq[seq.length - 1] - 3);
        }
        return { sequence: seq, isValid: true };
      },
      description: '-3씩 감소'
    }
  ];

  // 타이머 관리
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameStarted && !gameOver) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setMessage('시간이 종료되었습니다!');
            setGameOver(true);
            setShowGameOverModal(true); // 게임 오버 시 모달 표시
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

          await gameService.saveGameResult(Number(userId), GAME_IDS.LOGICAL_GAME, score);
          console.log('게임 결과 저장 완료 - 점수:', score);
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

  // 게임 시작 시와 점수 변경 시 문제 생성
  useEffect(() => {
    if (gameStarted && !gameOver) {
      createPattern();
    }
  }, [gameStarted, score]);

  const createPattern = (): void => {
    if (gameOver) return;

    let validSequence = false;
    let newSequence: number[] = [];
    let selectedPattern: Pattern | null = null;

    while (!validSequence) {
      const startNum = Math.floor(Math.random() * 10) + 1;
      selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
      const result = selectedPattern.generate(startNum);
      
      if (result.isValid) {
        newSequence = result.sequence;
        validSequence = newSequence.every(num => 
          num > 0 && num <= 12 && Number.isInteger(num)
        );
      }
    }
    
    const blankPosition = Math.floor(Math.random() * 4);
    const answer = newSequence[blankPosition];
    
    const displaySequence = newSequence.map((num, idx) => 
      idx === blankPosition ? '?' : num
    );

    setSequence(displaySequence);
    setCurrentPattern({
      answer: answer,
      description: selectedPattern!.description
    });
  };

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setGameOver(false);
    setMessage('');
    setUserAnswer('');
    setGameStarted(true);
    setShowGameOverModal(false); // 게임 시작 시 모달 숨김
  };

  const checkAnswer = (): void => {
    if (gameOver) return;

    const answer = parseInt(userAnswer.trim());
    
    if(isNaN(answer)) {
      setMessage('올바른 숫자를 입력해주세요!');
      return;
    }

    if(currentPattern && answer === currentPattern.answer) {
      let newScore = score + 1;
      setScore(newScore);
      setCorrectCount(prev => prev + 1); // 정답 횟수 증가
  
      // 🔥 레벨이 5 이상이면 성공 페이지로 이동
      if (level >= 5) {
        // 성공 페이지로 이동
        navigate('/game/complete');
        return; // 함수 종료
      }

      if (correctCount + 1 >= 5) { // 5번 맞혔을 때만 레벨 증가
        // 5번 맞혔을 때 현재 stage와 남은 시간을 기록
        setStageResults(prevResults => [...prevResults, { stage: level, timeLeft }]);
      
        setLevel(prev => prev + 1);
        setCorrectCount(0); // 다시 0으로 초기화
      }

      setMessage('정답입니다!');
      setUserAnswer('');
      setTimeout(() => {
        if (!gameOver) {
          setMessage('');
        }
      }, 1500);
    } else {
      setScore(prev => Math.max(0, prev - 1)); // 점수 깎기 로직 추가 (최소 0점)
      setMessage('틀렸습니다! 정답 수 하나가 감소합니다.');
      setUserAnswer('');
    }
  };

  return (
    <GamePage 
      title="숫자 패턴 찾기"
      // timeLimit={timeLeft ?? undefined}
      onRestart={() => {
        setGameStarted(false);
        setScore(0);
      }}
      gameStarted={gameStarted}
    >
      {!gameStarted ? (
        <div className="instructions">
          <h3 className="instructions-title">게임 방법</h3>
            <p className="instructions-content">1. 숫자들 사이에는 일정한 패턴이나 규칙(더하기, 빼기, 곱하기 등)이 있습니다.
            <br />2. 주어진 숫자들 사이 빈칸에 들어갈 숫자를 찾아 입력하세요.</p>
          <button onClick={() => setGameStarted(true)} className='instructions-button'>게임 시작</button>
          {message && <div className="final-score">{message}</div>}
        </div>
      ) : (
        <div className="">
          <div className="game-info-box">
            <div className="score">맞춘 문제 수: {score}</div>
            <div className="game-level">레벨: {level}</div>
          </div>

          <div className="sequence-display">
            {sequence.map((num, idx) => (
              <div key={idx} className="number-box">
                {num}
              </div>
            ))}
          </div>

          <div className="input-box">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  checkAnswer();
                }
              }}
              placeholder="정답을 입력하세요."
              disabled={gameOver}
            />
            <button 
              onClick={checkAnswer}
              disabled={gameOver}
              className='ok-button'
            >
              확인
            </button>
          </div>

          {message && (
            <div className={`message ${message.includes('정답') ? 'correct' : 'wrong'}`}>
              {message}
            </div>
          )}
        </div>
      )}
      <GameMiddleTermModal 
        open={showGameOverModal} 
        message="게임이 종료되었습니다!" 
        stage={level}
        stageResults={stageResults}
        onExit={() => setShowMiddleTermModal(false)}
      />
    </GamePage>
  );
};

export default PatternGame;
