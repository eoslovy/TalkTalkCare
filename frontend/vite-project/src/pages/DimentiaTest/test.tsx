import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/test.css';

const Test: React.FC = () => {
  useEffect(() => {
    // 임시로 userId를 로컬스토리지에 저장 (예: 1234)
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      localStorage.setItem('userId', '1'); // 실제 서비스에서는 세션에서 가져와야 함
      console.log('userId 저장됨: 1');
    }
  }, []);

  return (
    <div className="test-container">
      <div className="logo-section">
        <img src="/images/logo.png" alt="톡톡케어" className="logo" />
        <h1 className='font-bold'>톡톡케어</h1>
      </div>

      <div className="title-section">
        <h2 className='font-bold'>치매 진단 테스트</h2>
      </div>

      <div className="buttons-container">
        <div className="test-option">
          <h3>이용자</h3>
          <Link to="/smcq" className="test-button">
            SMCQ
          </Link>
        </div>

        <div className="test-option">
          <h3>보호자</h3>
          <Link to="/sdq" className="test-button">
            SDQ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Test;