import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import UserListItem from './UserListItem';
import '../../styles/components/FriendList.css';

interface Friend {
  id: string;
  name: string;
  status: string;
  time: string;
  image: string;
}

interface FriendListProps {
  onClose: () => void;
}

const FriendList: React.FC<FriendListProps> = ({ onClose }) => {
  const [friends, setFriends] = useState([
    { id: '1', name: '노진구', status: '', time: '', image: '/api/placeholder/40/40' },
    { id: '2', name: '윤덕총', status: '', time: '', image: '/api/placeholder/40/40' },
    { id: '3', name: '오주일', status: '', time: '', image: '/api/placeholder/40/40' },
    { id: '4', name: '전패현', status: '', time: '', image: '/api/placeholder/40/40' },
    { id: '5', name: '기임윤', status: '마지막 접속시간', time: '50분 전', image: '/api/placeholder/40/40' },
    { id: '6', name: '황다바', status: '마지막 접속시간', time: '24시간 전', image: '/api/placeholder/40/40' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="friend-container">
      <div className="w-80 h-screen fixed right-0 top-0 shadow-lg p-4">
        <div className="flex items-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full flex items-center justify-center" 
            style={{ 
              width: '40px', 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-bold flex-grow text-center">친구목록</h2>
          <div style={{ width: '40px' }}></div>
        </div>
        
        <div className="mb-4">
          <div className="search-bar search-bar flex items-center w-full" style={{display:'flex', justifyContent:'space-between'}}>
            <input
              type="search"
              placeholder="친구를 검색해보세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 bg-gray-100 rounded-lg"
            />
            <button type="submit" className="ml-2 p-2 bg-green-100 rounded-lg hover:bg-green-200" style={{width:'60px'}}>
              <span>검색</span>
            </button>
          </div>
        </div>
        
        <div className="friends-list-container">
          {filteredFriends.map(friend => (
            <div className="each-friend-container" key={friend.id}>
              <UserListItem
                name={friend.name}
                image={friend.image}
                status={friend.status}
                time={friend.time}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendList;
