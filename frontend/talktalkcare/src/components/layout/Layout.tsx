import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import ChatChat from './ChatChat';
import { Link } from 'react-router-dom';
import Footer from './Footerbar.tsx';
import { useFriendList } from '../../contexts/FriendListContext';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMainPage = location.pathname === '/';
  const { isFriendListOpen } = useFriendList();
  const { isLoggedIn } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const handleChatChatClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setModalOpen(true);
    }
  };

  const styles = {
    overlay: {
      position: "fixed" as "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modal: {
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "8px",
      textAlign: "center" as "center",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      maxWidth: "400px",
      width: "80%",
    },
    closeButton: {
      marginTop: "20px",
      padding: "10px 20px",
      backgroundColor: "#c8e6c9",
      color: "#214005",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      fontWeight: "bold",
    }
  };

  return (
<<<<<<< HEAD
    <>
      <Navbar />
      <Outlet />
      {isMainPage && !isFriendListOpen && ( 
        <Link 
          to="/talktalk" 
          onClick={handleChatChatClick}
        >
=======
    <div className="flex flex-col min-h-screen"> {/* 전체 레이아웃 설정 */}
      <Navbar />
      <main className="flex-grow"> {/* 남은 공간을 채우는 메인 콘텐츠 */}
        <Outlet />
      </main>
      {isMainPage && !isFriendListOpen && (
        <Link to="/talktalk">
>>>>>>> f4822f9e959cb9c18edc3bbeabdaaa81be146067
          <ChatChat />
        </Link>
      )}
      <Footer />
<<<<<<< HEAD

      {modalOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 className="card-title-box">로그인 필요</h2>
            <p className="text-xl">톡톡 서비스를 이용하려면 로그인이 필요합니다.</p>
            <button 
              onClick={() => {
                setModalOpen(false);
                navigate('/login');
              }} 
              style={styles.closeButton}
            >
              로그인하러 가기
            </button>
          </div>
        </div>
      )}
    </>
=======
    </div>
>>>>>>> f4822f9e959cb9c18edc3bbeabdaaa81be146067
  );
};

export default Layout;