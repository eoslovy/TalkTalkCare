import React, { useState } from 'react';
import { List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainMenu from '../components/main_page/MainMenu'
import Analytics from '../components/main_page/Analytics';
import FriendList from '../components/main_page/FriendList';
import '../styles/components/MainPage.css';

const MainPage: React.FC = () => {
  const [showFriendList, setShowFriendList] = useState(false);
  const navigate = useNavigate();

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
          <Analytics />
        </div>
      </div>

      {/* 친구 목록 표시 */}
      {showFriendList && (
        <div className="friend-list-container">
          <FriendList onClose={() => setShowFriendList(false)} />
        </div>
      )}
    </div>
  );
};

export default MainPage;