import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/keypad.css';
import phone from '../../assets/phoneicon.png';
import side from '../../assets/side.png';
import FriendList from '../../components/main_page/FriendList';
import CustomModal from '../../components/CustomModal';

const KeyPad: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState<string>('');
  const [showFriends, setShowFriends] = useState<boolean>(false); // 친구 목록 표시 여부 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/[^0-9]/g, ''); // 숫자만 남기기

    if (digits.startsWith('010')) {
      if (digits.length <= 3) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    } else {
      if (digits.length <= 2) return digits;
      if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
    }
  };

  // 버튼 클릭으로 숫자 추가
  const handleButtonClick = (value: string) => {
    setInput(prev => formatPhoneNumber(prev + value));
  };

  // 입력값 삭제
  const handleClear = () => {
    setInput(prev => {
      const newValue = prev.replace(/[^0-9]/g, '').slice(0, -1);
      return formatPhoneNumber(newValue);
    });
  };

  // 키보드 입력 처리
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const key = event.key;

    if (!isNaN(Number(key)) && key !== ' ') {
      // 숫자 키 입력 시
      setInput(prev => formatPhoneNumber(prev + key));
    } else if (key === 'Backspace') {
      // 백스페이스 키 입력 시
      setInput(prev => {
        const newValue = prev.replace(/[^0-9]/g, '').slice(0, -1);
        return formatPhoneNumber(newValue);
      });
    }
  };

  // 화상통화로 연결
  const handleCall = () => {
    if (input.length > 0) {
      navigate('/videocall');
    } else {
      setModalMessage('전화번호를 입력해주세요.');
      setIsModalOpen(true);
    }
  };

  // 친구 목록 발생
  const toggleFriendsList = () => {
    setShowFriends((prev) => !prev); // 친구 목록 표시/숨기기 토글
  };

  return (
    <div className="page-container" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="logo-section">
        <img src="/images/logo.png" alt="톡톡케어" className="logo" />
        <h1>톡톡케어</h1>
      </div>

      <div className="main-container">
        <div className="input-display-container">
          <div className="input-display">
            <span>{input}</span>
          </div>
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
          {/* 사이드 버튼 */}
          <div className="side-buttons">
            <button className="call-button" onClick={handleCall}>
              <img src={phone} alt="핸드폰" className='phone-icon'/>
              <span>전화걸기</span>
            </button>
            {/* Custom Modal */}
            <CustomModal
              title="알림"
              message={modalMessage} // 상황에 따라 다른 메시지 전달
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />

            <button className="contacts-button" onClick={toggleFriendsList}>
              <img src={side} alt="친구목록" className='contacts-icon'/>
              <span>친구 목록</span>
            </button>
            {/* 친구 목록 표시 */}
            {showFriends && <FriendList onClose={() =>
            setShowFriends(false)}/>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyPad;
