import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/components/smcq.css';

// 문항 데이터 배열 정의
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
  // 자가 진단단 문항들...
];

// API 서비스 분리
const submitSurvey = async (userId: number | null, testId: number, testResult: string) => {
  // 로그인한 사용자만 백엔드로 데이터 전송
  if (userId !== null) {
    const response = await fetch('/api/dementia-test/result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, testId, testResult }), // 요청 파라미터 포함
    });

    // 응답이 성공적이지 않으면 에러 발생
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // 응답 데이터를 JSON 형식으로 반환
    return response.json();
  } else {
    // 로그인하지 않은 사용자는 데이터를 전송하지 않음
    return Promise.resolve({ message: '로그인하지 않은 사용자입니다. 결과가 저장되지 않았습니다.' });
  }
};

const SMCQ: React.FC = () => {
  const navigate = useNavigate();
  // 각 문항의 응답을 저장할 상태 (초기값은 null로 설정)
  const [answers, setAnswers] = useState<Array<string | null>>(new Array(questions.length).fill(null));

  // 로그인한 사용자의 ID (예시: 실제로는 로그인 시스템에서 가져옴)
  const [userId, setUserId] = useState<number | null>(null); // 로그인한 사용자라면 값이 있고, 아니면 null
  // 테스트 ID (0: 보호자용, 1: 자가진단용)
  const [testId, setTestId] = useState<number>(1); // 0 또는 1

  // 컴포넌트가 마운트될 때 세션 정보를 가져오기
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/session'); // 세션 정보를 가져오는 API 호출
        if (response.ok) {
          const session = await response.json();
          setUserId(session.userId); // 세션에서 userId 추출하여 상태 업데이트
        } else {
          console.error('세션 정보를 가져오는 데 실패했습니다.');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    fetchSession();
  }, []); // 빈 배열을 전달하여 컴포넌트 마운트 시 한 번만 실행

  // 응답 처리 함수
  const handleAnswer = (index: number, answer: string) => {
    const newAnswers = [...answers]; // 현재 답변 배열을 복사
    newAnswers[index] = answer; // 선택한 답변으로 업데이트
    setAnswers(newAnswers); // 상태 업데이트
  };

  // 설문조사 제출 함수
  const handleSubmit = async () => {
    // 모든 문항이 답변되었는지 확인
    if (answers.includes(null)) {
      alert('모든 문항에 답변해 주세요.');
      return;
    }

    // testResult를 문자열 형식으로 변환 (예: "1: 1, 2: 0, 3: 1, ...")
    const testResult = answers
      .map((answer, index) => `${index + 1}: ${answer === '예' ? 1 : 0}`)
      .join(', ');

    // 콘솔에 데이터 출력 (백엔드로 전송될 데이터 확인)
    console.log('백엔드로 전송될 데이터:', {
      userId,
      testId,
      testResult,
    });

    try {
      // 백엔드로 데이터 전송 (로그인한 사용자만 전송)
      const result = await submitSurvey(userId, testId, testResult);
      console.log('Success:', result);

      // 결과 페이지로 이동 (필요한 경우 answers도 함께 전달)
      navigate('/result', { state: { answers } });
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
                  onClick={() => handleAnswer(index, '예')} // "예" 선택
                >
                  예
                </button>
                <button 
                  className={`answer-btn ${answers[index] === '아니오' ? 'selected' : ''}`}
                  onClick={() => handleAnswer(index, '아니오')} // "아니오" 선택
                >
                  아니오
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* 제출 버튼 추가 */}
        <div className="submit-section">
          <button 
            className="submit-button"
            onClick={handleSubmit} // 제출 버튼 클릭 시 handleSubmit 실행
          >
            제출하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SMCQ;