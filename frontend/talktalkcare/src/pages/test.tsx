import React from 'react';
import { Link } from 'react-router-dom';
import './test.css';

const Test: React.FC = () => {
  return (
    <div className="test-container">
      <div className="logo-section">
        <img src="/logo.png" alt="톡톡케어" className="logo" />
        <h1>톡톡케어</h1>
      </div>
      
      <div className="title-section">
        <h2>치매 진단 테스트</h2>
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
          <Link to="/smd" className="test-button">
            SMD
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Test;

