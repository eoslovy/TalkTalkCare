// UserListItem.tsx
import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { Friend } from './friends';
import CustomModal from '../CustomModal';
import '../../styles/components/UserListItem.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FriendItemProps {
  friend: Friend;
  onRemove?: () => void;
  onCall?: () => void;
}

const FriendItem: React.FC<FriendItemProps> = ({ friend, onRemove, onCall }): JSX.Element => {
  // 확인 모달 (예/아니오) 상태
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  // API 응답 또는 취소 시 보여줄 커스텀 모달 상태
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [sessionId, setSessionId] = useState('');

  // 전화 버튼 클릭 시 확인 모달 열기
  const handleCall = () => {
    setIsConfirmModalOpen(true);
  };

  // '예' 클릭 시: API 요청 후 결과에 따라 커스텀 모달 메시지 업데이트
  const handleConfirmCall = async () => {
    setIsConfirmModalOpen(false);
    const userId = localStorage.getItem('userId');

    // 호출마다 고유 세션 ID 생성
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    localStorage.setItem('currentSessionId', newSessionId);

    try {
      const response = await fetch(`${BASE_URL}/call/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          callerId: userId, 
          receiverPhone: friend.phone, 
          openviduSessionId: newSessionId 
        }),
        credentials: 'include',
      });
      const data = await response.json();

      if (data.result.msg !== 'success') {
        setModalTitle('취소됨');
        setModalMessage(data.result.msg);
        localStorage.removeItem('currentSessionId');
      } else {
        setModalTitle('대기중');
        setModalMessage('호출 알림을 보냈습니다. 상대방의 응답을 기다려주세요.');
      }
    } catch (error) {
      setModalTitle('오류');
      setModalMessage('통신 중 오류가 발생했습니다.');
      localStorage.removeItem('currentSessionId');
    }

    setIsCustomModalOpen(true);
  };

  // '아니오' 클릭 시: 취소 메시지를 가진 커스텀 모달 열기
  const handleCancelCall = () => {
    setIsConfirmModalOpen(false);
    setModalTitle('취소됨');
    setModalMessage('통화 신청이 취소되었습니다.');
    setIsCustomModalOpen(true);
  };

  return (
    <div className="friend-item">
      <div className="friend-item-avatar-container">
        <img 
          src={friend.s3Filename || '/default-avatar.png'} 
          alt={friend.name}
          className="friend-item-avatar" 
        />
        <div 
          className={`friend-item-status-dot ${friend.status.toLowerCase()}`}
          title={friend.status === 'ONLINE' ? '온라인' : friend.displayStatus}
        />
      </div>
      <div className="friend-item-content">
        <h3 className="friend-item-name">{friend.name}</h3>
        <div className="friend-item-status">
          {friend.status === 'ONLINE' 
            ? '온라인' 
            : `오프라인`
          }
        </div>
        <div className="friend-item-details">
          <span>{friend.phone}</span>
        </div>
      </div>
      <div className="friend-item-actions">
        <button 
          className="friend-item-call-btn"
          onClick={handleCall}
          title="전화하기"
        >
          <Phone size={36} strokeWidth={2} color="black" />
        </button>
      </div>

      {/* 확인용 모달 (예/아니오) */}
      {isConfirmModalOpen && (
        <div style={confirmationStyles.overlay}>
          <div style={confirmationStyles.modal}>
            <h2 className="card-title-box">
              {friend.name}님에게 화상통화를 신청할까요?
            </h2>
            <div className="modal-actions">
              <button 
                style={confirmationStyles.confirmButton}
                onClick={handleConfirmCall}
              >
                예
              </button>
              <button 
                style={confirmationStyles.closeButton}
                onClick={handleCancelCall}
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결과/응답용 커스텀 모달 */}
      <CustomModal
        title={modalTitle}
        message={modalMessage}
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
      />
    </div>
  );
};

const confirmationStyles = {
  overlay: {
    position: "fixed" as "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center" as "center",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    width: "80%",
  },
  closeButton: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#c8e6c9",
    color: "#214005",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    fontWeight: "bold" as "bold",
    width: "90px",
    marginLeft: "15px",
  },
  confirmButton: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#c8e6c9",
    color: "#214005",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    fontWeight: "bold" as "bold",
    width: "90px",
    marginRight: "15px",
  },
};

export default FriendItem;
