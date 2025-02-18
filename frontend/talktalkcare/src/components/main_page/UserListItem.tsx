// UserListItem.tsx
import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { Friend } from './friends';
import '../../styles/components/UserListItem.css';

interface FriendItemProps {
  friend: Friend;
  onRemove?: () => void;
  onCall?: () => void;
}

const FriendItem: React.FC<FriendItemProps> = ({ 
  friend, 
  onRemove, 
  onCall 
}): JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCall = () => {
    setIsModalOpen(true);
  };

  const handleConfirmCall = () => {
    setIsModalOpen(false);
    onCall && onCall();
  };

  const handleCancelCall = () => {
    setIsModalOpen(false);
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
            : `오프라인 · ${friend.displayStatus}`
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

      {isModalOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 className="card-title-box"
             style={styles.cardbox}>전화를 걸시겠습니까?</h2>
            <div className="modal-actions">
              <button 
                style={styles.confirmButton}
                onClick={handleConfirmCall}
              >
                예
              </button>
              <button 
                style={styles.closeButton}
                onClick={handleCancelCall}
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
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
    height: "30%"
  },
  closeButton: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#c8e6c9",
    color: "#214005",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    font: "bold",
    width:'90px',
    marginLeft: "15px"
  },
  cardbox: {
    marginTop:"15px"
  },
  confirmButton: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#c8e6c9",
    color: "#214005",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    font: "bold",
    width:'90px',
    marginRight: "15px"
  },
};

export default FriendItem;
