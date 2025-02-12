import React, { useState } from 'react';
import { List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainMenu from '../components/main_page/MainMenu'
import Analytics from '../components/main_page/Analytics';
import FriendList from '../components/main_page/FriendList';
import '../styles/components/MainPage.css';
import CardNews from '../components/main_page/Cardnews';

const MainPage: React.FC = () => {
  const [showFriendList, setShowFriendList] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const wsUrl = "ws://localhost:8080/ws";
  const apiUrl = "http://localhost:8080/api";

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