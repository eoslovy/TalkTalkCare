// FriendItem.tsx
import React from 'react';
import '../../styles/components/UserListItem.css';
import { Friend } from './friends';

interface FriendItemProps {
  friend: Friend;
  onRemove?: () => void;
}

const FriendItem: React.FC<FriendItemProps> = ({ friend, onRemove }): JSX.Element => {
  return (
    <div className="friend-item">
      <div className="friend-item-avatar-container">
        <img 
          src={friend.s3Filename || 'api/placeholder/40/40'} 
          alt={friend.name}
          className="friend-item-avatar" 
        />
        <div 
          className={`friend-item-status-dot ${
            friend.status === 'ONLINE' 
              ? 'online' 
              : 'offline'
          }`}
        />
      </div>
      <div className="friend-item-content">
        <h3 className="friend-item-name">{friend.name}</h3>
        <div className="friend-item-status">
          {friend.status === 'ONLINE' ? '온라인' : `오프라인 · ${friend.displayStatus}`}
        </div>
        <div className="friend-item-details">
          <span>{friend.phone}</span>
        </div>
      </div>
      {onRemove && (
        <button 
          onClick={onRemove}
          className="friend-item-remove-btn"
        >
          삭제
        </button>
      )}
    </div>
  );
};

export default FriendItem;
