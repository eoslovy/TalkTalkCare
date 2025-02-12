// FriendList.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import AddFriendModal from './AddFriendModal';
import FriendItem from './UserListItem';
import '../../styles/components/FriendList.css';
import { useWebSocket } from './hooks/useWebSocket';

export interface Friend {
  userId: number;
  name: string;
  phone: string;
  s3Filename?: string;
  status: 'ONLINE' | 'OFFLINE';
  lastActiveTime: string;
  displayStatus: string;
}

interface FriendListProps {
  userId: number;
  onClose: () => void;
}

const FriendList: React.FC<FriendListProps> = ({ userId, onClose }): JSX.Element => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleStatusUpdate = (updatedFriend: Friend) => {
    console.log('친구 상태 업데이트:', updatedFriend);
    setFriends((prevFriends) =>
      prevFriends.map((friend) =>
        friend.userId === updatedFriend.userId
          ? { ...friend, ...updatedFriend }
          : friend
      )
    );
  };

  const { isConnected } = useWebSocket(handleStatusUpdate); // userId는 로컬 스토리지에서 가져옴

  const loadFriends = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/friends/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Friend list response:', data);

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
  }, [userId]);

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

    return filteredFriends.map(friend => (
      <FriendItem key={friend.userId} friend={friend} />
    ));
  };
  const username = localStorage.getItem('username');
  console.log(username)
  return (
    <div className="friend-list-container">
      <div className="friend-list-header">
        <button 
          onClick={onClose} 
          className="friend-list-back-button"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="friend-list-title">
          친구목록 {isConnected ? '(온라인)' : '(오프라인)'}
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

      <div className="friend-list-content">
        {renderContent()}
      </div>

      {showAddModal && (
        <AddFriendModal
          userId={userId}
          onClose={() => setShowAddModal(false)}
          onFriendAdded={loadFriends}
        />
      )}
    </div>
  );
};

export default FriendList;
