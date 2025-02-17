import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/keypad.css';
import phone from '../../assets/phoneicon.png';
import side from '../../assets/side.png';
import FriendList from '../../components/main_page/FriendList';
import CustomModal from '../../components/CustomModal';

import { useEffect } from 'react';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const KeyPad: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState<string>('');
  const [showFriends, setShowFriends] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>('');

  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/[^0-9]/g, '');

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
  // 키 이벤트 처리 (handleKeyDown 수정)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') {
      handleButtonClick(e.key); // 숫자 키 입력 시 전화번호 추가
    } else if (e.key === 'Backspace') {
      handleClear(); // 백스페이스 키 입력 시 삭제
    } else if (e.key === 'Enter') {
      handleCall(); // 엔터 키 입력 시 전화 걸기
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
  const handleCall = async () => {
    const digits = input.replace(/[^0-9]/g, '');
    if (!digits) {
      setModalMessage('전화번호를 입력해주세요.');
      setIsModalOpen(true);
      return;
    }
    if (!digits.startsWith('010') || digits.length !== 11) {
      setModalMessage('유효한 전화번호를 입력해주세요.');
      setIsModalOpen(true);
      return;
    }

    const userId = localStorage.getItem('userId');

    // 호출마다 고유 세션 ID 생성 (caller가 미리 OpenVidu 세션에 접속)
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    localStorage.setItem('currentSessionId', newSessionId); // 📌 세션 ID 저장

    try {
      const response = await fetch(`${BASE_URL}/call/request`, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ callerId: userId, receiverPhone: digits,  openviduSessionId: newSessionId }),
        credentials: 'include'
      });
      const data = await response.json();

      // receiver가 오프라인이거나 가입된 사용자가 아니라면
      if (data.result.msg !== 'success') {
        setModalMessage(data.result.msg);
        setIsModalOpen(true);

        localStorage.removeItem('currentSessionId');
      } else { // receiver가 온라인이라면 receiver에게 웹소켓을 통해 메세지 보냄
        setModalMessage("호출 알림을 보냈습니다. 상대방의 응답을 기다려주세요.");
        setIsModalOpen(true);
        // await openviduService.joinSession(newSessionId);

        // navigate('/videocall');
      }
      setIsModalOpen(true);
    } catch (error) {
      setModalMessage('일시적인 서버 오류가 발생했습니다.');
      setIsModalOpen(true);
    }
  };

  const toggleFriendsList = () => {
    setShowFriends(prev => !prev);
  };

  // 키 이벤트 등록 및 해제
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleButtonClick(e.key); // 숫자 입력 처리
      } else if (e.key === 'Backspace') {
        handleClear(); // 백스페이스 처리
      } else if (e.key === 'Enter') {
        handleCall(); // 엔터로 전화 걸기
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return (
    <div className="page-container">
      <div className={`page-section ${showFriends ? 'shift-left' : ''}`}>
        <div className="text-section">
          <p className='call-title'>화상 전화 사용법</p>
          <ol>
            <li>🖤전화하고 싶은 사람의 번호를 입력합니다.</li>
            <li>🖤상대방이 톡톡케어 회원이어야 합니다.</li>
            <li>🖤상대방이 서비스에 접속 중일 경우 화상 전화가 연결됩니다.</li>
          </ol>
        </div>

        <div className="main-container">
        <div 
            className="input-display-container" 
            tabIndex={0} 
            onKeyDown={handleKeyDown}
          >
            <div className="input-display">
              <span>{input}</span>
            </div>
            {input.length > 0 && (
              <button className="clear-button" onClick={handleClear}>⌫</button>
            )}
          </div>
          
          <div className="bottom-section">
            <div className="keypad-grid">
              {[...'123456789*0#'].map((key) => (
                <button key={key} className="keypad-button" onClick={() => handleButtonClick(key)}>
                  {key}
                </button>
              ))}
            </div>
            <div className="side-buttons">
              <button className="call-button" onClick={handleCall}>
                <img src={phone} alt="핸드폰" className='phone-icon'/>
                <span>전화걸기</span>
              </button>
              <CustomModal
                title="알림"
                message={modalMessage}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
              />
              <button className="contacts-button" onClick={toggleFriendsList}>
                <img src={side} alt="친구목록" className='contacts-icon'/>
                <span>친구 목록</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {showFriends && (
        <div className="friend-list-container">
          <FriendList friends={[]} setFriends={() => {}} onClose={() => setShowFriends(false)}/>
        </div>
      )}
    </div>
  );
};

export default KeyPad;
