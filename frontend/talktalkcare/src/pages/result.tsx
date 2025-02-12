import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './result.css';

// 상태 타입 정의
interface LocationState {
    answers: string[];
  }

const Result: React.FC = () => {
  const location = useLocation();
  // 타입 단언을 사용하여 state의 타입 지정
  const state = location.state as LocationState;
  // answers가 undefined일 경우를 대비해 빈 배열을 기본값으로 설정
  const answers = state?.answers || [];

  // 결과 계산 로직
  const calculateResult = () => {
    const yesCount = answers.filter(answer => answer === '예').length;
    return yesCount;
  };

  return (
    <div className="result-container">
      <div className="logo-section">
        <img src="/logo.png" alt="톡톡케어" className="logo" />
        <h1>톡톡케어</h1>
      </div>
      
      <div className="content-section">
        <h2>치매진단<br />테스트 결과</h2>
        
        <div className="result-box">
          <div className="result-content">
            <p>총 {answers.length}문항 중 {calculateResult()}개의 항목에서 
               치매 위험이 감지되었습니다.</p>
          </div>
        </div>
        
        <Link to="/game" className="game-button">
          게임 하러가기
        </Link>
      </div>
    </div>
  );
};

export default Result;
