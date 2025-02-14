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

  // 키 이벤트 처리 (handleKeyDown 추가)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') {
      handleButtonClick(e.key); // 숫자키 입력 시 전화번호 추가
    } else if (e.key === 'Backspace') {
      handleClear(); // 백스페이스 키 입력 시 지우기
    }
  };

  return (
    <div className="page-container" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className='page-section'>
        {/* 왼쪽 서비스 설명 텍스트 */}
        <div className="text-section">
          <p className='call-title'>화상 전화 사용법</p>
          <ol>
            <li>🖤전화하고 싶은 사람의 번호를 입력합니다.</li>
            <li>🖤상대방이 톡톡케어 회원이어야 합니다.</li>
            <li>🖤상대방이 서비스에 접속 중일 경우 화상 전화가 연결됩니다.</li>
          </ol>
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
              {showFriends && <FriendList onClose={() => setShowFriends(false)}/>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyPad;
