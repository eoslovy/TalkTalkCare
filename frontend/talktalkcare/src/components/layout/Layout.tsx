import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ChatChat from './ChatChat';
import { Link } from 'react-router-dom';
import Footer from './Footerbar.tsx';
import { useFriendList } from '../../contexts/FriendListContext'; // ✅ 추가

const Layout = () => {
  const location = useLocation();
  const isMainPage = location.pathname === '/';
  const { isFriendListOpen } = useFriendList();

  return (
    <div className="flex flex-col min-h-screen"> {/* 전체 레이아웃 설정 */}
      <Navbar />
      <main className="flex-grow"> {/* 남은 공간을 채우는 메인 콘텐츠 */}
        <Outlet />
      </main>
      {isMainPage && !isFriendListOpen && (
        <Link to="/talktalk">
          <ChatChat />
        </Link>
      )}
      <Footer />
    </div>
  );
};

export default Layout;
