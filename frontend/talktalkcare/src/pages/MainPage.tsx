import React, { useState, useEffect } from 'react';
import { List, LogOut } from 'lucide-react'; // LogOut 아이콘 추가
import { useNavigate,useLocation  } from 'react-router-dom';
import MainMenu from '../components/main_page/MainMenu'
import FriendList from '../components/main_page/FriendList';
import '../styles/components/MainPage.css';
import CardNews from '../components/main_page/CardNews';
import { authService } from '../services/authService'; // authService import
import { useWebSocket } from '../contexts/WebSocketContext';
import { Friend } from '../types/friend';  // 타입 임포트 추가
import { useFriendList } from '../contexts/FriendListContext' // ✅ 추가
import LoadingModal from '../components/LoadingModal'; // 🔥 로딩 모달 추가


const MainPage: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const { isConnected, onFriendStatusUpdate } = useWebSocket();
  const navigate = useNavigate();
  const location = useLocation(); // 현재 location 정보 가져오기
  const userId = localStorage.getItem('userId');
  const wsUrl = import.meta.env.VITE_API_WS_URL;
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { isFriendListOpen, setIsFriendListOpen } = useFriendList();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsFriendListOpen(false);
  }, [location, setIsFriendListOpen]);

  useEffect(() => {
    // 5초 동안 로딩 상태 유지 후 로딩 완료 (데이터 불러오는 시뮬레이션)
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  }, []);


  // 실제 API 요청시 걸리는 기간 동안 로딩 모달 띄우기
  // useEffect(() => {
  //   const fetchFriends = async () => {
  //     try {
  //       setIsLoading(true); // ✅ 로딩 시작
  //       const response = await fetch('https://api.example.com/friends');
  //       const data = await response.json();
  //       setIsFriendListOpen(data);
  //     } catch (error) {
  //       console.error('친구 목록 불러오기 실패:', error);
  //     } finally {
  //       setIsLoading(false); // ✅ 로딩 끝
  //     }
  //   };

  // 초기 친구 목록 로드
  const loadFriends = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${apiUrl}/friends/${userId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.result?.msg === 'success') {
        setFriends(data.body || []);
      }
    } catch (error) {
      console.error('친구 목록 로드 실패:', error);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadFriends();
  }, []);

  const handleFriendUpdate = (updatedFriends: Friend[]) => {
    console.log('상태 업데이트 시도:', updatedFriends);
    if (Array.isArray(updatedFriends) && updatedFriends.length > 0) {
      setFriends(prev => {
        const updatedList = [...prev];
        updatedFriends.forEach(updatedFriend => {
          const index = updatedList.findIndex(f => f.userId === updatedFriend.userId);
          if (index !== -1) {
            updatedList[index] = {
              ...updatedList[index],
              status: updatedFriend.status,
              displayStatus: updatedFriend.displayStatus,
            };
          } else {
            updatedList.push({
              ...updatedFriend,
              lastActiveTime: null
            });
          }
        });
        return updatedList;
      });
      console.log('친구 목록 업데이트 완료');
    }
  };

  // WebSocket 업데이트 리스너 설정
  useEffect(() => {
    console.log('WebSocket 업데이트 리스너 설정 시작');
    
    if (onFriendStatusUpdate) {
      console.log('🎯 콜백 함수 등록');
      onFriendStatusUpdate(handleFriendUpdate);
    }

    return () => {
      console.log('🧹 WebSocket 리스너 정리');
      if (onFriendStatusUpdate) {
        onFriendStatusUpdate(undefined);
      }
    };
  }, [onFriendStatusUpdate]);

  // friends 상태가 변경될 때마다 로그
  useEffect(() => {
    console.log('🔄 친구 목록 상태 실제 변경됨:', friends);
  }, [friends]);
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={`main-page-container ${isFriendListOpen ? 'friend-list-open' : ''}`}>
      <div className="main-page-content">
        {!isFriendListOpen && userId && (
          <div className="friend-list-toggle">
            <button onClick={() => setIsFriendListOpen(true)} aria-label="친구 목록 열기">
              <List size={28} />
            </button>
          </div>
        )}

        <div className={`menu-card ${isFriendListOpen ? 'compressed' : ''}`}>
          <MainMenu isFriendListOpen={isFriendListOpen} />
          <CardNews isFriendListOpen={isFriendListOpen} />
        </div>
      </div>

      {isFriendListOpen && (
        <div className="friend-list-container">
          {isLoading && <LoadingModal />}
          <FriendList
            friends={friends}
            setFriends={setFriends}
            userId={parseInt(userId)}
            onClose={() => setIsFriendListOpen(false)}
            wsUrl={wsUrl}
            apiUrl={apiUrl}
          />
        </div>
      )}
    </div>
  );
};

export default MainPage;