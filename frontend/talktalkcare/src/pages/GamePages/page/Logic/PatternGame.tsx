import React, { useState, useEffect } from 'react';
import './PatternGame.css';
import GamePage from '../GamePage';

//숫자 추론 게임 
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
  const [showAnswer, setShowAnswer] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [currentPattern, setCurrentPattern] = useState<CurrentPattern | null>(null);

  const createPattern = (): void => {
    const patterns: Pattern[] = [
      // +2씩 증가
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
      // -2씩 감소
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
      // +3씩 증가
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
      // -3씩 감소
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

  const checkAnswer = (): void => {
    const answer = parseInt(userAnswer.trim());
    
    if(isNaN(answer)) {
      setMessage('올바른 숫자를 입력해주세요!');
      return;
    }

    if(currentPattern && answer === currentPattern.answer) {
      setScore(score + (level * 10));
      setLevel(level + 1);
      setMessage('정답입니다!');
      setUserAnswer('');
      setTimeout(() => {
        createPattern();
        setMessage('');
      }, 1500);
    } else {
      setMessage('틀렸습니다. 다시 시도해보세요.');
    }
  };

  useEffect(() => {
    if(gameStarted) {
      createPattern();
      setTimeLeft(60);
    }
  }, [gameStarted]);

  useEffect(() => {
    if(timeLeft === 0) {
      setGameStarted(false);
      setMessage(`게임 종료! 최종 점수: ${score}`);
    }
    
    if(timeLeft && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, score]);

  return (
    <GamePage 
      title="숫자 패턴 찾기"
      timeLimit={timeLeft ?? undefined}
      onRestart={() => {
        setGameStarted(false);
        setScore(0);
      }}
      gameStarted={gameStarted}
    >
      {!gameStarted ? (
        <div className="instructions">
          <h3>게임 방법</h3>
          <p>1. 주어진 숫자들의 규칙을 찾아보세요.</p>
          <p>2. 숫자는 순차적으로 더하기(+1, +2, +3), 빼기(-1), 또는 곱하기(×2)됩니다.</p>
          <p>3. 빈칸(?)에 들어갈 알맞은 숫자를 입력하세요.</p>
          <button onClick={() => setGameStarted(true)}>게임 시작</button>
          {message && <div className="final-score">{message}</div>}
        </div>
      ) : (
        <div className="game-content">
          <div className="game-info">
            <div className="score">점수: {score}</div>
            <div className="level">레벨: {level}</div>
            <div className="timer">남은 시간: {timeLeft}초</div>
          </div>

          <div className="sequence-display">
            {sequence.map((num, idx) => (
              <div key={idx} className="number-box">
                {num}
              </div>
            ))}
          </div>

          <div className="input-section">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="빈칸에 들어갈 숫자를 입력하세요"
            />
            <button onClick={checkAnswer}>확인</button>
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

export default PatternGame; 