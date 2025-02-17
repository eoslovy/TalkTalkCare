import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/components/Navbar.css';
import signup_icon from '../../assets/Signup.png';
import login_icon from '../../assets/login.png';
import mypage_icon from '../../assets/mypage.png';
import logout_icon from '../../assets/logout.png';
import { authService } from '../../services/authService'; // 이렇게 수정

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn, userName } = useAuth();

  const handleLogout = async () => {
    try {
      // authService의 logout 메서드 호출
      await authService.logout();

      // localStorage 초기화
      localStorage.removeItem('userId');
      localStorage.removeItem('name');
      localStorage.removeItem('profile-image');
      localStorage.removeItem('token');

      // AuthContext 상태 업데이트
      setIsLoggedIn(false);

      // 메인 페이지로 이동
      navigate('/', { replace: true });
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-middle" style={{ backgroundColor: '#F5FFEA' }}>
        <Link to="/" className="navbar-left">
          <img src="/images/logo.png" alt="로고" className="logo-image" 
          style={{ width:'30px', height:'30px' }}/>
          <p className="navbar-title ml-2 text-2xl">톡톡케어</p>
        </Link>

        <div className="navbar-menu">
          {isLoggedIn ? (
            <>
              <p className="text-md mr-2">
                <p style={{color:'green'}}>{userName} <span style={{color:'black'}}>님</span><br /> <span style={{color:'black'}}>반갑습니다!</span></p>
              </p>
              <div className="" style={{ display: 'flex', alignItems: 'center' }}>
                <Link to="/mypage" className="navbar-link">
                  <img src={mypage_icon} alt="내 정보" className="menu-icon" />
                  <p className='navbar-menu-text text-md'>내 정보</p>
                </Link>
              </div>
              <button onClick={handleLogout} className="navbar-link">
                <img src={logout_icon} alt="로그아웃" className="menu-icon" />
                <p className='navbar-menu-text text-md'>로그아웃</p>
              </button>
            </>
          ) : (
            <>
            <div className="" style={{ display: 'flex', alignItems: 'center' }}>
              <Link to="/sign-up" className="navbar-link">
                <img src={signup_icon} alt="회원가입" className="menu-icon" />
                <p className='navbar-menu-text text-md'>회원가입</p>
              </Link>
              <Link to="/login" className="navbar-link">
                <img src={login_icon} alt="로그인" className="menu-icon" />
                <p className='navbar-menu-text text-md'>로그인</p>
              </Link>
            </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;