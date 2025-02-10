import React from 'react';
import { Friend } from '../../types/friend';
import styles from './FriendItem.module.css';

interface FriendItemProps {
  friend: Friend;
  onRemove: () => void;
}

const FriendItem: React.FC<FriendItemProps> = ({ friend, onRemove }) => {
  return (
    <div className={styles.friendItem}>
      <div className={styles.profileImage}>
        {friend.s3Filename ? (
          <img 
            src={`${process.env.REACT_APP_API_URL}${friend.s3Filename}`} 
            alt={friend.name} 
          />
        ) : (
          <div className={styles.defaultProfile}>
            {friend.name[0]}
          </div>
        )}
      </div>
      <div className={styles.info}>
        <h3>{friend.name}</h3>
        <div className={styles.status}>
          <span 
            className={`${styles.statusDot} ${
              friend.status === 'ONLINE' ? styles.online : styles.offline
            }`}
          />
          <span>{friend.displayStatus}</span>
        </div>
      </div>
    </div>
  );
};

export default FriendItem;