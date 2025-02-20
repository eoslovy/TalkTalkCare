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
import CustomModal from '../components/CustomModal';


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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');

  useEffect(() => {
    setIsFriendListOpen(false);
  }, [location, setIsFriendListOpen]);

  // useEffect(() => {
  //   if (!userId) return;
  //   // 초기 친구 목록 로드
  //   const loadFriends = async () => {
  //     if (!userId) return;
  
  //     try {
  //       setIsLoading(true); // ✅ 로딩 시작
  //       const response = await fetch(`${apiUrl}/friends/${userId}`, {
  //         credentials: 'include'
  //       });
  //       const data = await response.json();
  //       if (data.result?.msg === 'success') {
  //         setFriends(data.body || []);
  //       }
  //     } catch (error) {
  //       //console.error('친구 목록 로드 실패:', error);
  //     } finally {
  //       setIsLoading(false); // ✅ 로딩 끝
  //     }
  //   };
  //   });

  useEffect(() => {
    if (!userId) {
      setIsLoading(false); // ✅ 로그인 안 된 경우 로딩 해제
      return;
    }
    loadFriends();
  }, [userId]);

  // 초기 친구 목록 로드
  const loadFriends = async () => {
    if (!userId) {
      setIsLoading(false); // ✅ userId가 없으면 로딩 해제
      return;
    }

    try {
      setIsLoading(true); // ✅ 로딩 시작
      const response = await fetch(`${apiUrl}/friends/${userId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.result?.msg === 'success') {
        setFriends(data.body || []);
      }
    } catch (error) {
      //console.error('친구 목록 로드 실패:', error);
    } finally {
      setIsLoading(false); // ✅ 로딩 끝
    }
  };

  // 초기 로드
  useEffect(() => {
    loadFriends();
  }, []);

  const handleFriendUpdate = (updatedFriends: Friend[]) => {
    //console.log('상태 업데이트 시도:', updatedFriends);
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
      //console.log('친구 목록 업데이트 완료');
    }
  };

  // WebSocket 업데이트 리스너 설정
  useEffect(() => {
    //console.log('WebSocket 업데이트 리스너 설정 시작');
    
    if (onFriendStatusUpdate) {
      //console.log('🎯 콜백 함수 등록');
      onFriendStatusUpdate(handleFriendUpdate);
    }

    return () => {
      //console.log('🧹 WebSocket 리스너 정리');
      if (onFriendStatusUpdate) {
        onFriendStatusUpdate(undefined);
      }
    };
  }, [onFriendStatusUpdate]);

  // friends 상태가 변경될 때마다 로그
  useEffect(() => {
    //console.log('🔄 친구 목록 상태 실제 변경됨:', friends);
  }, [friends]);
  
  const handleLogout = async () => {

      const response = await authService.logout();

      if(response.data.msg === 'success')  {
        navigate('/login'); 
      } else{
        setModalMessage('로그아웃에 실패했습니다.');
        setIsModalOpen(true);
      } 
  };

  return (
    <div className={`main-page-container ${isFriendListOpen ? 'friend-list-open' : ''}`}>
      {isLoading && <LoadingModal />}
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
        <div className="friend-list-container-main">
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
      <CustomModal
      title="알림"
      message={modalMessage}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default MainPage;