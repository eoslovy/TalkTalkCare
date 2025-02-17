import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/components/sdq.css';
import CustomModal from '../../../components/CustomModal';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log(import.meta.env.VITE_API_BASE_URL);

const questions = [
  "전화번호나 사람이름을 기억하기 힘들다.",
  "어떤 일이 언제 일어났는지 기억하지 못할 때가 있다.",
  "며칠 전에 들었던 이야기를 잊는다.",
  "오래 전부터 들었던 이야기를 잊는다.",
  // ... (기존의 모든 문항들)
];

const submitSurvey = async (userId: number | null, testId: number, testResult: string) => {
  // 비로그인 사용자의 경우 임시 userId 생성
  const finalUserId = userId || Math.floor(Math.random() * 1000000);

  const response = await fetch(`${BASE_URL}/dementia-test/result`,{ 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      userId: finalUserId, 
      testId, 
      testResult 
    }),
  }); 

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

const SDQ: React.FC = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Array<string | null>>(new Array(questions.length).fill(null));
  const [userId, setUserId] = useState<number | null>(null);
  const [testId, setTestId] = useState<number>(2);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");

  useEffect(() => {
    // 로컬 스토리지에서 userId 가져오기 (선택적)
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(Number(storedUserId));
    }
  }, []);

  const handleAnswer = (index: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      setModalMessage('모든 문항에 답변해 주세요.');
      setIsModalOpen(true);
      return;
    }

    const testResult = answers
      .map((answer, index) => `${index + 1}: ${answer === '예' ? 1 : 0}`)
      .join(', ');

    try {
      const result = await submitSurvey(userId, testId, testResult);
      console.log('Success:', result);
      navigate('/result', { state: { answers, testType: 'SDQ' } });
    } catch (error) {
      console.error('Error:', error);
      setModalMessage('설문조사 제출에 실패했습니다. 다시 시도해 주세요.');
      setIsModalOpen(true);
    }
  };

  return (
    <div className="sdq-container">
      <div className="content-section">
        <h2 className='test-title'>보호자용 테스트</h2>
        <div className="instruction">
          이 테스트는 <span className='font-bold'>보호자용 테스트</span>입니다. <br />
          다음 문항을 읽고 최근 <span className='font-bold'>6개월 간의</span> 해당 사항에
          "예" 또는 "아니오"를 선택해주세요.
        </div>
        <div className="questions">
          {questions.map((question, index) => (
            <div key={index} className="question-item">
              <div className="question-text">
                {index + 1}. {question}
              </div>
              <div className="answer-buttons">
                <button 
                  className={`answer-btn-yes ${answers[index] === '예' ? 'selected' : ''}`}
                  onClick={() => handleAnswer(index, '예')}
                >
                  예
                </button>
                <button 
                  className={`answer-btn-no ${answers[index] === '아니오' ? 'selected' : ''}`}
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
          <CustomModal
              title="알림"
              message={modalMessage}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
        </div>
      </div>
    </div>
  );
};

export default SDQ;