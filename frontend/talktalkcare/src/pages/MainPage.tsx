import React, { useState, useEffect } from 'react';
import { List, LogOut } from 'lucide-react'; // LogOut 아이콘 추가
import { useNavigate } from 'react-router-dom';
import MainMenu from '../components/main_page/MainMenu'
import FriendList from '../components/main_page/FriendList';
import '../styles/components/MainPage.css';
import CardNews from '../components/main_page/CardNews';
import { authService } from '../services/authService'; // authService import

const MainPage: React.FC = () => {
  const [showFriendList, setShowFriendList] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const wsUrl = import.meta.env.REACT_APP_WS_URL;
  const apiUrl = import.meta.env.REACT_API_APP__URL;

  useEffect(() => {
    if (!userId) {
      console.log('userId is not available.');
      navigate('/login');
    } else {
      console.log('userId:', userId);
    }
  }, [userId, navigate]);

  if (!userId) {
    return null;
  }
  console.log('ㅎㅇㅇ')
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
    <div className="main-page-container">
      <div className="main-page-content">
        {/* 친구 목록 열기 버튼 */}
        {!showFriendList && (
          <div className="friend-list-toggle">
            <button onClick={() => setShowFriendList(true)} aria-label="친구 목록 열기">
              <List size={28} />
            </button>
          </div>
        )}

        {/* 메뉴 카드 (일렬 정렬) */}
        <div className="menu-card">
          <MainMenu />
          {/* <Analytics /> */}
          <CardNews/>
        </div>
      </div>

      {showFriendList && (
        <div className="friend-list-container">
          <FriendList
            userId={parseInt(userId)}
            onClose={() => setShowFriendList(false)}
            wsUrl={wsUrl}
            apiUrl={apiUrl}
            />
        </div>
      )}
    </div>
  );
};

export default MainPage;