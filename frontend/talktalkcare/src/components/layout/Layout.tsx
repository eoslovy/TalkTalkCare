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
  const { isFriendListOpen } = useFriendList(); // ✅ context 사용

  return (
    <>
      <Navbar />
      <Outlet />
      {isMainPage && !isFriendListOpen && ( // ✅ 친구 목록이 열려있을 때 챗봇 아이콘 숨김
        <Link to="/talktalk">
          <ChatChat />
        </Link>
      )}
      <Footer />
    </>
  );
};

export default Layout;
