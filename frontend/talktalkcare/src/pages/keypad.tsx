import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // useNavigate 추가
import './keypad.css';

const Keypad: React.FC = () => {
  const navigate = useNavigate();  // useNavigate 훅 사용
  const [input, setInput] = useState<string>('');

  const handleButtonClick = (value: string) => {
    setInput(prev => prev + value);
  };

  const handleClear = () => {
    setInput('');
  };

  const handleCall = () => {
    if (input.length > 0) {
      navigate('/video-call');
    } else {
      alert('전화번호를 입력해주세요.');
    }
  };

  return (
    <div className="page-container">
      <div className="logo-section">
        <img src="/logo.png" alt="톡톡케어" className="logo" />
        <h1>톡톡케어</h1>
      </div>

      <div className="main-container">
        <div className="input-display">
          {input}
          {input.length > 0 && (
            <button className="clear-button" onClick={handleClear}>⌫</button>
          )}
        </div>
        
        <div className="bottom-section">
          <div className="keypad-grid">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
              <button
                key={key}
                className="keypad-button"
                onClick={() => handleButtonClick(key)}
              >
                {key}
              </button>
            ))}
          </div>
        {/* 사이드 버튼 추가 */}
        <div className="side-buttons">
            <button className="call-button" onClick={handleCall}>
              <span className="phone-icon">📞</span>
              <span>전화걸기</span>
            </button>
            <button className="contacts-button">
              <span className="contacts-icon">👥</span>
              <span>친구 목록</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Keypad;
