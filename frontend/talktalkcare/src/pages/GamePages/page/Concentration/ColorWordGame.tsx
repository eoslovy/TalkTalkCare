import React, { useState, useEffect } from 'react';
import './ColorWordGame.css';
import GamePage from '../GamePage';
import GameMiddleTermModal from '../GameMiddleTermModal';
import GameComplete from '../GameComplete';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [message, setMessage] = useState<string>('');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentChoices, setCurrentChoices] = useState<Color[]>([]);
  const [level, setLevel] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [stage, setStage] = useState<number>(1);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [showMiddleTermModal, setShowMiddleTermModal] = useState<boolean>(false);
  const [showComplete, setShowComplete] = useState<boolean>(false);
  const [completedLevel, setCompletedLevel] = useState<number>(0);
  const [stageResults, setStageResults] = useState<{stage: number, timeLeft: number}[]>([]);
  const [currentGameTime, setCurrentGameTime] = useState<number>(0);
  const navigate = useNavigate();

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

  const stageConfig = {
    1: { time: 60, target: 1, choices: 3 },
    2: { time: 40, target: 1, choices: 4 },
    3: { time: 30, target: 1, choices: 5 }
  };

  useEffect(() => {
    if (gameStarted && timeLeft !== null) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === 1) {
            setShowMiddleTermModal(true);
            setGameStarted(false);
            // 시간 초과 시에도 결과 저장
            setStageResults(prev => [...prev, { stage: stage, timeLeft: 0 }]);
            clearInterval(timer);
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted, timeLeft, stage]);

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

    // 문제 유형 결정 (의미하는 색상 vs 보이는 색상)
    const questionType = Math.random() < 0.5 ? '가 의미하는' : '의';
    const correctColor = questionType.includes('의미하는') 
      ? colors[meaningIndex] 
      : colors[colorIndex];

    // 정답을 포함한 보기 생성
    const currentStageChoices = stageConfig[stage as keyof typeof stageConfig].choices;
    let choices: Color[] = [correctColor]; // 정답 먼저 추가

    // 남은 보기 슬롯에 랜덤한 색상 추가
    while (choices.length < currentStageChoices) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      // 중복 방지
      if (!choices.some(choice => choice.code === randomColor.code)) {
        choices.push(randomColor);
      }
    }
    
    // 보기 순서 섞기
    const shuffledChoices = shuffleArray(choices);

    setTimeLeft(stageConfig[stage as keyof typeof stageConfig].time);
    setCurrentWord(newWord);
    setCurrentChoices(shuffledChoices);
    setCurrentQuestion(`이 단어${questionType} 색상을 선택하세요`);
    setMessage('');
    setGameStarted(true);
  };

  const checkAnswer = (selectedColor: string): void => {
    const correctColor = currentQuestion.includes('의미하는') 
      ? currentWord?.meaningColor 
      : currentWord?.textColor;

    if (selectedColor === correctColor) {
      setMessage('정답입니다!');
      setCorrectCount(prev => {
        const newCount = prev + 1;
        // 목표 달성 시 스테이지 완료 처리
        if (newCount >= stageConfig[stage as keyof typeof stageConfig].target) {
          handleStageComplete();
          return 0; // 카운트 초기화
        }
        return newCount;
      });
    } else {
      setMessage('틀렸습니다!');
    }

    // 스테이지가 완료되지 않았을 때만 다음 문제 생성
    if (correctCount < stageConfig[stage as keyof typeof stageConfig].target - 1) {
      setTimeout(generateQuestion, 1500);
    }
  };

  // 시간 업데이트 핸들러
  const handleTimeUpdate = (time: number) => {
    setCurrentGameTime(time);
  };

  // 스테이지 완료 처리
  const handleStageComplete = () => {
    // 현재 스테이지와 남은 시간 저장
    setStageResults(prev => [...prev, { 
      stage: stage, 
      timeLeft: currentGameTime 
    }]);
    
    // 3단계 완료시 바로 GameComplete로 이동
    if (stage === 3) {
      const totalScore = stageResults.reduce((acc, result) => {
        const stageConfig = {
          1: { time: 60 },
          2: { time: 40 },
          3: { time: 30 }
        };
        const baseScore = result.stage * 10;
        const timePercentage = (result.timeLeft / stageConfig[result.stage as keyof typeof stageConfig].time);
        const bonusScore = baseScore * timePercentage;
        return acc + baseScore + bonusScore;
      }, 0);

      // API 호출
      fetch(`${BASE_URL}/games/save-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          gameId: 2,
          score: Math.round(totalScore)
        })
      }).then(() => {
        navigate('/game/complete', {
          state: {
            isForceQuit: false,
            completedLevel: 3,
            previousGame: 'colorword'
          }
        });
      }).catch(error => {
        console.error('Error saving game result:', error);
        navigate('/game/complete', {
          state: {
            isForceQuit: false,
            completedLevel: 3,
            previousGame: 'colorword'
          }
        });
      });
    } else {
      // 1, 2단계는 기존대로 모달 표시
      setShowMiddleTermModal(true);
    }
    
    setGameStarted(false);
    setCorrectCount(0);
  };

  const handleExit = () => {
    navigate('/game/complete', {
      state: {
        isForceQuit: true,
        completedLevel: stage,
        previousGame: 'colorword',
      }
    });
  };

  const handleNextStage = () => {
    setShowMiddleTermModal(false);  // 모달 닫기
    setStage(prev => prev + 1);     // 스테이지 증가
    
    // 새로운 스테이지 설정을 위한 초기화
    setTimeLeft(stageConfig[(stage + 1) as keyof typeof stageConfig].time);
    setGameStarted(false);          // 게임 시작 상태를 false로 설정
    setCorrectCount(0);             // 정답 카운트 초기화
    
    // 게임 관련 상태 초기화
    setCurrentWord(null);
    setMessage('');
    setCurrentQuestion('');
    setCurrentChoices([]);
  };

  const handleRestart = () => {
    setGameStarted(false);
    setStage(0);
    setCorrectCount(0);
    generateQuestion();
  };

  return (
    <div>
      {showComplete ? (
        <GameComplete 
          isForceQuit={true}
          completedLevel={completedLevel}
          onRestart={() => {
            setShowComplete(false);
            setGameStarted(false);
            setStage(0);
            setCorrectCount(0);
            setCompletedLevel(0);
            generateQuestion();
          }}
        />
      ) : (
        <GamePage 
          title="색깔 단어 읽기"
          timeLimit={stageConfig[stage as keyof typeof stageConfig].time}
          onRestart={handleRestart}
          gameStarted={gameStarted}
          onTimeUpdate={handleTimeUpdate}
        >
          {!gameStarted ? (
            <div className="instructions">
              <h3 className='instructions-title'>게임 방법</h3>
              <p className='.instructions-content'>
                1. 화면에 나타나는 색깔 단어를 보세요.
                <br />2. 문제가 요구하는 색상(단어가 의미하는 색상 또는 보이는 색상)을 선택하세요.
                <br />3. 올바른 선택을 하면 다음 문제로 넘어갑니다.
                <br />4. 각 단계별 목표 개수를 달성하면 다음 단계로 넘어갑니다.
              </p>
              <button onClick={() => {
                setGameStarted(true);
                generateQuestion();
              }} className='instructions-button'>
                {stage === 1 ? '게임 시작' : `${stage}단계 시작`}
              </button>
            </div>
          ) : (
            <div className="game-box">
              <div className="game-info">
                <div className="game-level">레벨: {level}</div>
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
      )}

      <GameMiddleTermModal 
        open={showMiddleTermModal}
        stage={stage}
        stageResults={stageResults}
        message={`${stage}단계를 클리어하셨습니다!`}
        onNext={stage < 3 ? handleNextStage : undefined}
        onExit={handleExit}
      />
    </div>
  );
};

export default ColorWordGame; 