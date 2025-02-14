// FriendList.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import AddFriendModal from './AddFriendModal';
import FriendItem from './UserListItem';
import { Friend } from './friends';
import '../../styles/components/FriendList.css';
import { Link } from 'react-router-dom';
import talktalkImage from '../../assets/talktalk.png'; // 이미지 import

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FriendListProps {
  onClose: () => void;
  friends: Friend[];
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
}

const FriendList: React.FC<FriendListProps> = ({ 
  onClose, 
  friends,
  setFriends
}): JSX.Element => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isConnected } = useWebSocket();

  const loadFriends = async () => {
    const userIdFromStorage = localStorage.getItem("userId");
    if (!userIdFromStorage) {
      setError('사용자 ID를 찾을 수 없습니다.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/friends/${userIdFromStorage}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.result?.msg === 'success') {
        setFriends(data.body || []);
      }
    } catch (error) {
      console.error('Failed to load friends:', error);
      setError('친구 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    console.log('FriendList에 전달된 friends:', friends);
  }, [friends]);

  const renderContent = () => {
    if (error) {
      return <div className="friend-list-error">{error}</div>;
    }

    if (isLoading) {
      return <div className="friend-list-loading">로딩 중...</div>;
    }

    const filteredFriends = friends.filter(friend => 
      friend.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredFriends.length === 0) {
      return <div className="friend-list-empty">
        {searchTerm ? '검색 결과가 없습니다.' : '친구 목록이 비어있습니다.'}
      </div>;
    }

    return (
      <div className="friend-items-container">
        {filteredFriends.map(friend => (
          <FriendItem
            key={friend.userId}
            friend={friend}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="friend-list-wrapper">
      <div className="friend-list-header">
        <button onClick={onClose} className="friend-list-back-button">
          <ArrowLeft size={24} />
        </button>
        <h2 className="friend-list-title">
          친구목록
        </h2> 
        <button
          onClick={() => setShowAddModal(true)}
          className="friend-list-add-button"
        >
          <UserPlus size={24} />
        </button>
      </div>
      <hr 
      style={{ 
        marginBottom:'10px',
        marginTop:'-25px'
       }}/>
      <div className="friend-list-search-container">
        <input
          type="search"
          placeholder="친구를 검색해보세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="friend-list-search-input"
        />
      </div>

      <Link to="/talktalk" className="friend-item profile-item">
        <div className="profile-image-container">
          <img 
            src={talktalkImage} 
            alt="톡톡이" 
            className="profile-image"
          />
        </div>
        <div className="profile-info">
          <div className="profile-name">내 친구 톡톡이</div>
        </div>
      </Link>
      
      <div className="friend-list-content">
        {renderContent()}
        {/* {isConnected ? '(온라인)' : '(오프라인)'} */}
      </div>

      {showAddModal && (
        <AddFriendModal
          onClose={() => setShowAddModal(false)}
          onFriendAdded={() => {
            console.log('친구 추가됨');
            loadFriends();
          }}
        />
      )}
    </div>
  );
};

export default FriendList;
