import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ChatChat from './ChatChat';
import { Link } from 'react-router-dom';
import Footer from './Footerbar.tsx';
import { useFriendList } from '../../contexts/FriendListContext'; // ✅ 추가
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const location = useLocation();
  const isMainPage = location.pathname === '/';
  const { isLoggedIn } = useAuth();
  const { isFriendListOpen } = useFriendList();

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <Outlet />
      {isMainPage && !isFriendListOpen && !isLoggedIn && ( 
        <Link to="/talktalk">
          <ChatChat />
        </Link>
      )}
      <Footer />
    </>
  );
};

export default Layout;
