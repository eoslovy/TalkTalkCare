import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/components/smcq.css';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log(import.meta.env.VITE_API_BASE_URL);

const questions = [
  "기억력에 문제가 있다고 생각하나요?",
  "기억력이 10년 전보다 나빠졌다고 생각하나요?",
  "기억력이 같은 또래의 다른 사람들에 비해 나쁘다고 생각하나요?",
  "기억력 저하로 인해 일상생활에 불편을 느끼나요?",
  "최근에 일어난 일을 기억하기 어렵나요?",
  "며칠 전에 나눈 대화 내용을 기억하기 어렵나요?",
  "며칠 전에 한 약속을 기억하기 어렵나요?",
  "친한 사람의 이름을 기억하기 어렵나요?",
  "사용한 물건을 둔 곳을 기억하기 어렵나요?",
  "이전에 비해 물건을 자주 잃어버리나요?",
  "집 근처에서 길을 잃은 적이 있나요?",
  "가게에서 2~3가지 물건을 사려고 할 때 물건 이름을 기억하기 어렵나요?",
  "가스불이나 전기불 끄는 것을 기억하기 어렵나요?",
  "자주 사용하는 전화번호(자신 혹은 자녀)를 기억하기 어렵나요?"
];
// const BASE_URL = 'http://localhost:8443/api'

const submitSurvey = async (userId: number | null, testId: number, testResult: string) => {
  if (userId !== null) {
    console.log('userId:', userId);
    console.log('testId:', testId);
    console.log('testResult:', testResult); 
    const response = await fetch(`http://localhost:8443/api/dementia-test/result`,{ 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, testId, testResult }), // 요청 파라미터 포함
    }); 
    console.log('Response:', response);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.json();
  } else {
    return Promise.resolve({ message: '로그인하지 않은 사용자입니다. 결과가 저장되지 않았습니다.' });
  }
};

const SMCQ: React.FC = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Array<string | null>>(new Array(questions.length).fill(null));
  const [userId, setUserId] = useState<number | null>(null);
  const [testId, setTestId] = useState<number>(1);

  useEffect(() => {
    // 로컬 스토리지에서 userId 가져오기
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(Number(storedUserId)); // 로컬 스토리지에서 가져온 값으로 상태 업데이트
      console.log('userId:', storedUserId);
    } else {
      console.error('로그인 정보가 없습니다. 로그인해주세요.');
      navigate('/login'); // 로그인 페이지로 리다이렉트
    }
  }, [navigate]);

  const handleAnswer = (index: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      alert('모든 문항에 답변해 주세요.');
      return;
    }

    const testResult = answers
      .map((answer, index) => `${index + 1}: ${answer === '예' ? 1 : 0}`)
      .join(', ');

    try {
      const result = await submitSurvey(userId, testId, testResult);
      console.log('Success:', result);
      navigate('/result', { state: { answers, testType: 'SMCQ' } });
    } catch (error) {
      console.error('Error:', error);
      alert('설문조사 제출에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className="smcq-container">
      <div className="logo-section">
        <img src="/logo.png" alt="톡톡케어" className="logo" />
        <h1>톡톡케어</h1>
      </div>
      <div className="content-section">
        <h2>치매진단 테스트</h2>
        <div className="instruction">
          다음 문항을 읽고 최근 6개월 간의 해당 사항에<br />
          "예" 또는 "아니오"를 선택하시오
        </div>
        <div className="questions">
          {questions.map((question, index) => (
            <div key={index} className="question-item">
              <div className="question-text">
                {index + 1}. {question} {/* 문항 번호는 1부터 시작 */}
              </div>
              <div className="answer-buttons">
                <button 
                  className={`answer-btn ${answers[index] === '예' ? 'selected' : ''}`}
                  onClick={() => handleAnswer(index, '예')}
                >
                  예
                </button>
                <button 
                  className={`answer-btn ${answers[index] === '아니오' ? 'selected' : ''}`}
                  onClick={() => handleAnswer(index, '아니오')}
                >
                  아니오
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="submit-section">
          <button 
            className="submit-button"
            onClick={handleSubmit}
          >
            제출하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SMCQ;
