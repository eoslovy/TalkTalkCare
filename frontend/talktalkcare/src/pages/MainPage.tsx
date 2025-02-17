import React, { useState, useEffect } from 'react';
import { List, LogOut } from 'lucide-react'; // LogOut 아이콘 추가
import { useNavigate } from 'react-router-dom';
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
  const [showFriendList, setShowFriendList] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const { isConnected, onFriendStatusUpdate } = useWebSocket();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const wsUrl = import.meta.env.VITE_API_WS_URL;
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { isFriendListOpen, setIsFriendListOpen } = useFriendList(); // ✅ context 사용
  const [isLoading, setIsLoading] = useState(true); // ✅ 로딩 상태 추가

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
    if (!userId) return;  // 친구 목록 로드만 userId가 있을 때 수행

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
            // 기존 데이터 구조 유지하면서 업데이트
            updatedList[index] = {
              ...updatedList[index],
              status: updatedFriend.status,
              displayStatus: updatedFriend.displayStatus,
              // lastActiveTime은 null로 유지
            };
          } else {
            // 새로운 친구 추가 시에는 서버 형식에 맞춤
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
      
      // 로컬 스토리지 및 세션 관련 데이터 제거
      localStorage.removeItem('userId');
      localStorage.removeItem('token'); // 토큰이 있다면
      localStorage.removeItem('username');
      // 로그인 페이지로 리다이렉트
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={`main-page-container ${isFriendListOpen ? 'friend-list-open' : ''}`}>
      <div className="main-page-content">
        {/* 친구 목록 토글 버튼 */}
        {!isFriendListOpen && userId && (
          <div className="friend-list-toggle">
            <button onClick={() => setIsFriendListOpen(true)} aria-label="친구 목록 열기">
              <List size={28} />
            </button>
          </div>
        )}

        {/* 메뉴 카드 (일렬 정렬, 친구 목록 열릴 때 크기 조정) */}
        <div className={`menu-card ${isFriendListOpen ? 'compressed' : ''}`}>
          <MainMenu isFriendListOpen={isFriendListOpen} />
          <CardNews isFriendListOpen={isFriendListOpen} />
        </div>
      </div>

      {/* 친구 목록 (isFriendListOpen 상태 활용) */}
      {isFriendListOpen && (
        <div className="friend-list-container">
          {/* 🔥 로딩 중이면 모달 표시 */}
          {isLoading && <LoadingModal />}
          <FriendList
            friends={friends}
            setFriends={setFriends}
            // onClose={() => setShowFriendList(false)}
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