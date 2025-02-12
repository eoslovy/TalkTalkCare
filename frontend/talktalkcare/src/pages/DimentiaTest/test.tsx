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

      <div className="title-section">
        <p className='test-title font-bold'>치매 진단 테스트</p>
      </div>

      <div className="buttons-container">
        
        <Link to="/smcq" className="test-button">
          <p className='test-option'>이용자용 테스트</p>
          <p><br />SMCQ</p>
        </Link>

        <Link to="/sdq" className="test-button">
          <p className='test-option'>보호자용 테스트</p>
          <p><br />SDQ</p>
        </Link>
        
      </div>
    </div>
  );
};

export default Test;