import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/components/sdq.css';
import CustomModal from '../../../components/CustomModal';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log(import.meta.env.VITE_API_BASE_URL);

// 문항 데이터 배열 정의
const questions = [
  "전화번호나 사람이름을 기억하기 힘들다.",
  "어떤 일이 언제 일어났는지 기억하지 못할 때가 있다.",
  "며칠 전에 들었던 이야기를 잊는다.",
  "오래 전부터 들었던 이야기를 잊는다.",
  "반복되는 일상 생활에 변화가 생겼을 때 금방 적응하기 힘들다.",
  "본인에게 중요한 사항을 잊을 때가 있다.(배우자 생일, 결혼기념일 등)",
  "다른 사람에게 같은 이야기를 반복할 때가 있다.",
  "어떤 일을 해 놓고도 잊어버려 다시 반복할 때가 있다.",
  "약속을 해 놓고 잊을 때가 있다.",
  "이야기 도중 방금 자기가 무슨 이야기를 하고 있었는지 잊을 때가 있다.",
  "약 먹는 시간을 놓치기도 한다.",
  "여러 가지 물건을 사러 갔다가 한두 가지를 빠뜨리기도 한다.",
  "가스 불을 끄는 것을 잊어버리거나 음식을 태운 적이 있다.",
  "남에게 같은 질문을 반복한다.",
  "어떤 일을 해 놓고도 했는지 안 했는지 몰라 다시 확인해야 한다.",
  "물건을 두고 다니거나 또는 가지고 갈 물건을 놓고 간다.",
  "하고 싶은 말이나 표현이 금방 떠오르지 않는다.",
  "물건 이름이 금방 생각나지 않는다.",
  "개인적인 편지나 사무적인 편지를 쓰기 힘들다.",
  "갈수록 말수가 감소되는 경향이 있다.",
  "신문이나 잡지를 읽을 때 이야기 줄거리를 파악하지 못한다.",
  "책을 읽을 때 같은 문장을 여러 번 읽어야 이해가 된다.",
  "텔레비전에 나오는 이야기를 따라가기 힘들다.",
  "자주 보는 친구나 친척을 바로 알아보지 못한다.",
  "물건을 어디에 두고 나중에 어디에 두었는지 몰라 찾게 된다.",
  "전에 가본 장소를 기억하지 못한다.",
  "방향감각이 떨어졌다.",
  "길을 잃거나 헤맨 적이 있다.",
  "물건을 항상 두는 장소를 잊어버리고 엉뚱한 곳을 찾는다.",
  "계산 능력이 떨어졌다.",
  "돈 관리를 하는 데 실수가 있다.",
  "과거에 쓰던 기구 사용이 서툴러졌다."
  // 보호자 문항들...
];

const submitSurvey = async (userId: number | null, testId: number, testResult: string) => {
  if (userId !== null) {
    console.log('userId:', userId);
    console.log('testId:', testId);
    console.log('testResult:', testResult); 
    const response = await fetch(`${BASE_URL}/dementia-test/result`,{ 
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

const SDQ: React.FC = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Array<string | null>>(new Array(questions.length).fill(null));
  const [userId, setUserId] = useState<number | null>(null);
  const [testId, setTestId] = useState<number>(2);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");

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
                {index + 1}. {question} {/* 문항 번호는 1부터 시작 */}
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
              message={modalMessage} // 상황에 따라 다른 메시지 전달
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
        </div>
      </div>
    </div>
  );
};

export default SDQ;