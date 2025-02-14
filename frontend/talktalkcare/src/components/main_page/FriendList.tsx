// FriendList.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useWebSocket } from './hooks/useWebSocket';
import AddFriendModal from './AddFriendModal';
import FriendItem from './UserListItem';
import { Friend } from './friends';
import '../../styles/components/FriendList.css';
import { Link } from 'react-router-dom';
import talktalkImage from '../../assets/talktalk.png'; // 이미지 import

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FriendListProps {
  onClose: () => void;
}

const FriendList: React.FC<FriendListProps> = ({ onClose }): JSX.Element => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleStatusUpdate = (updatedFriend: Friend) => {
    console.log('👥 친구 상태 업데이트:', updatedFriend);
    setFriends(prev => prev.map(friend => 
      friend.userId === updatedFriend.userId
        ? { ...friend, ...updatedFriend }
        : friend
    ));
  };

  const { isConnected, connectionState } = useWebSocket(handleStatusUpdate);

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
    const connectionStatus = (() => {
      switch (connectionState) {
        case WebSocket.CONNECTING:
          return '연결 중';
        case WebSocket.OPEN:
          return '연결됨';
        case WebSocket.CLOSING:
          return '연결 종료 중';
        case WebSocket.CLOSED:
          return '연결 종료됨';
        default:
          return '알 수 없음';
      }
    })();
    
    console.log('🔌 WebSocket 연결 상태:', connectionStatus);
  }, [connectionState]);

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading-message">로딩 중...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    if (friends.length === 0) {
      return <div className="empty-message">현재 친구가 없습니다.</div>;
    }

    if (filteredFriends.length === 0) {
      return <div className="empty-message">검색 결과가 없습니다</div>;
    }

    return (
      <>
        {filteredFriends.map(friend => (
          <FriendItem key={friend.userId} friend={friend} />
        ))}
      </>
    );
  };

  return (
    <div className="friend-list-container">
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
          {/* <div className="status-dot" /> */}
        </div>
        <div className="profile-info">
          <div className="profile-name">내 친구 톡톡이</div>
          {/* <div className="profile-status">
            <span>온라인</span>
            <span> · </span>
            <span>AI 챗봇</span>
          </div> */}
        </div>
      </Link>

      <div className="friend-list-content">
        {renderContent()}
        {/* {isConnected ? '(온라인)' : '(오프라인)'} */}
      </div>

      {showAddModal && (
        <AddFriendModal
          onClose={() => setShowAddModal(false)}
          onFriendAdded={loadFriends}
        />
      )}
    </div>
  );
};

export default FriendList;
