// File: WsColorWordGame.tsx
import React, { useState, useEffect, useCallback } from 'react';
import './ColorWordGame.css';
import GamePage from '../WsGamePage';
import GameMiddleTermModal from '../GameMiddleTermModal';
import GameComplete from '../GameComplete';
import { useNavigate } from 'react-router-dom';
import { sendGameEvent as sendGameEventAPI } from '../../../../services/gameEventService';
import { useWebSocket } from '../../../../contexts/WebSocketContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Color {
  name: string;
  code: string;
}

interface Word {
  text: string;
  textColor: string;
  meaningColor: string;
}

const stageConfig = {
  1: { time: 60, target: 1, choices: 3 },
  2: { time: 40, target: 1, choices: 4 },
  3: { time: 30, target: 1, choices: 5 }
};

const WsColorWordGame: React.FC = () => {
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
  const [stageResults, setStageResults] = useState<{ stage: number; timeLeft: number }[]>([]);
  const [currentGameTime, setCurrentGameTime] = useState<number>(0);
  const [opponentAnswer, setOpponentAnswer] = useState<string | null>(null);

  const navigate = useNavigate();
  const { onGameSelected } = useWebSocket();

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

  // 각 클라이언트에서 타이머는 독립적으로 작동
  useEffect(() => {
    if (gameStarted && timeLeft !== null) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === 1) {
            setShowMiddleTermModal(true);
            setGameStarted(false);
            setStageResults(prevResults => [...prevResults, { stage, timeLeft: 0 }]);
            clearInterval(timer);
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted, timeLeft, stage]);

  // 배열 무작위 섞기 함수
  const shuffleArray = (array: Color[]): Color[] => {
    let currentIndex = array.length;
    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  // 새 질문 생성 및 이벤트 전송 (타이머 관련 정보는 보내지 않습니다)
  const generateQuestion = useCallback((): void => {
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

    const questionType = Math.random() < 0.5 ? '가 의미하는' : '의';
    const correctColor = questionType.includes('의미하는')
      ? colors[meaningIndex]
      : colors[colorIndex];

    const currentStageChoices = stageConfig[stage as keyof typeof stageConfig].choices;
    let choices: Color[] = [correctColor];
    while (choices.length < currentStageChoices) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      if (!choices.some(choice => choice.code === randomColor.code)) {
        choices.push(randomColor);
      }
    }
    const shuffledChoices = shuffleArray(choices);

    // 타이머는 각 클라이언트에서 개별적으로 관리
    setCurrentWord(newWord);
    setCurrentChoices(shuffledChoices);
    const questionText = `이 단어${questionType} 색상을 선택하세요`;
    setCurrentQuestion(questionText);
    setMessage('');
    setGameStarted(true);

    // 웹소켓 이벤트 전송 (타이머 관련 값은 제외)
    const currentUserId = Number(localStorage.getItem('userId'));
    const opponentUserId = Number(localStorage.getItem('opponentUserId'));
    const event = {
      eventType: 'COLORWORD_NEW_QUESTION',
      senderId: currentUserId,
      opponentUserId: opponentUserId,
      payload: {
        newWord,
        shuffledChoices,
        currentQuestion: questionText
      }
    };
    sendGameEventAPI(event);
  }, [colors, stage]);

  // 웹소켓 이벤트 수신
  useEffect(() => {
    onGameSelected((event: any) => {
      const localUserId = localStorage.getItem('userId');
      if (event.senderId === localUserId) return;
      if (event.eventType === 'COLORWORD_NEW_QUESTION') {
        const payload = event.payload;
        setCurrentWord(payload.newWord);
        setCurrentChoices(payload.shuffledChoices);
        setCurrentQuestion(payload.currentQuestion);
        setGameStarted(true);
      } else if (event.eventType === 'COLORWORD_ANSWER_SELECTED') {
        setOpponentAnswer(event.payload.selectedColor);

      } else if (event.eventType === 'COLORWORD_STAGE_COMPLETE') {
        const payload = event.payload;
        setStage(payload.stage);
        setStageResults(prev => [...prev, { stage: payload.stage, timeLeft: 0 }]);
        setShowMiddleTermModal(true);
        setGameStarted(false);
      }
    });
  }, [onGameSelected]);

  // 정답 선택 및 이벤트 전송
  const checkAnswer = (selectedColor: string): void => {
    const correctColor = currentQuestion.includes('의미하는')
      ? currentWord?.meaningColor
      : currentWord?.textColor;
    const isCorrect = selectedColor === correctColor;

    setMessage(isCorrect ? '정답입니다!' : '틀렸습니다!');
    setCorrectCount(prev => {
      const newCount = prev + 1;
      if (newCount >= stageConfig[stage as keyof typeof stageConfig].target) {
        handleStageComplete();
        return 0;
      }
      return newCount;
    });

    const currentUserId = Number(localStorage.getItem('userId'));
    const opponentUserId = Number(localStorage.getItem('opponentUserId'));
    const answerEvent = {
      eventType: 'COLORWORD_ANSWER_SELECTED',
      senderId: currentUserId,
      opponentUserId: opponentUserId,
      payload: { selectedColor, isCorrect }
    };
    sendGameEventAPI(answerEvent);

    if (correctCount < stageConfig[stage as keyof typeof stageConfig].target - 1) {
      setTimeout(generateQuestion, 1500);
    }
  };

  // 남은 시간 업데이트 핸들러 (타이머는 개별적으로 작동)
  const handleTimeUpdate = (time: number) => {
    setCurrentGameTime(time);
  };

  // 스테이지 완료 및 이벤트 전송
  const handleStageComplete = () => {
    setStageResults(prev => [...prev, { stage, timeLeft: currentGameTime }]);
    if (stage === 3) {
      // 점수 계산 후 게임 종료 처리 (여기서는 개별 클라이언트 타이머 사용)
      // (점수 계산 로직은 그대로 유지)
      const totalScore = stageResults.reduce((acc, result) => {
        const config = { 1: { time: 60 }, 2: { time: 40 }, 3: { time: 30 } };
        const baseScore = result.stage * 10;
        const timePercentage = result.timeLeft / config[result.stage as keyof typeof config].time;
        const bonusScore = baseScore * timePercentage;
        return acc + baseScore + bonusScore;
      }, 0);

      fetch(`${BASE_URL}/games/save-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          gameId: 2,
          score: Math.round(totalScore)
        })
      })
        .then(() => {
          navigate('/game/complete', {
            state: {
              isForceQuit: false,
              completedLevel: 3,
              previousGame: 'colorword'
            }
          });
        })
        .catch(error => {
          //console.error('Error saving game result:', error);
          navigate('/game/complete', {
            state: {
              isForceQuit: false,
              completedLevel: 3,
              previousGame: 'colorword'
            }
          });
        });
    } else {
      setShowMiddleTermModal(true);
    }

    const currentUserId = Number(localStorage.getItem('userId'));
    const opponentUserId = Number(localStorage.getItem('opponentUserId'));
    const stageEvent = {
      eventType: 'COLORWORD_STAGE_COMPLETE',
      senderId: currentUserId,
      opponentUserId: opponentUserId,
      payload: { stage }
    };
    sendGameEventAPI(stageEvent);

    setGameStarted(false);
    setCorrectCount(0);
  };

  const handleExit = () => {
    navigate('/game/complete', {
      state: {
        isForceQuit: true,
        completedLevel: stage,
        previousGame: 'colorword'
      }
    });
  };

  const handleNextStage = () => {
    setShowMiddleTermModal(false);
    setStage(prev => prev + 1);
    setTimeLeft(stageConfig[(stage + 1) as keyof typeof stageConfig].time);
    setGameStarted(false);
    setCorrectCount(0);
    setCurrentWord(null);
    setMessage('');
    setCurrentQuestion('');
    setCurrentChoices([]);
  };

  const handleRestart = () => {
    setGameStarted(false);
    setStage(1);
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
            setStage(1);
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
              <h3 className="instructions-title">게임 방법</h3>
              <p className="instructions-content">
                1. 화면에 나타나는 색깔 단어를 보세요.
                <br />
                2. 문제가 요구하는 색상(단어가 의미하는 색상 또는 보이는 색상)을 선택하세요.
                <br />
                3. 올바른 선택을 하면 다음 문제로 넘어갑니다.
                <br />
                4. 각 단계별 목표 개수를 달성하면 다음 단계로 넘어갑니다.
              </p>
              <button
                onClick={() => {
                  setGameStarted(true);
                  generateQuestion();
                }}
                className="instructions-button"
              >
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
              <div className="word-display" style={{ color: currentWord?.textColor }}>
                {currentWord?.text}
              </div>
              <div className="color-choices">
                {currentChoices.map(color => (
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

export default WsColorWordGame;
