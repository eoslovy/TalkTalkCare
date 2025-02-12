import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/Navbar.css';
import talktalk_robot from '../../assets/talktalk.png'; // 톡톡이 로봇 이미지
import signup_icon from '../../assets/signup.png'; // 회원가입 아이콘
import login_icon from '../../assets/login.png'; // 로그인 아이콘
import test_icon from '../../assets/test.png'; // 진단 테스트 아이콘
import mypage_icon from '../../assets/mypage.png'; // 내 정보 아이콘

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-middle" style={{ backgroundColor: '#F5FFEA' }}>
        {/* 로고와 제목 */}
        <Link to="/" className="navbar-left">
          <img src="/images/logo.png" alt="로고" className="logo-image" />
          <p className="navbar-title ml-2 text-2xl">톡톡케어</p>
        </Link>

        {/* 오른쪽 메뉴 */}
        <div className="navbar-menu">
          {/* 각 메뉴에 아이콘과 텍스트 추가 */}
          {/* <Link to="/talktalk" className="navbar-link">
            <img src={talktalk_robot} alt="톡톡이" className="menu-icon" />
            <p className='text-md'>톡톡이</p>
          </Link> */}
          <Link to="/sign-up" className="navbar-link">
            <img src={signup_icon} alt="회원가입" className="menu-icon" />
            <p className='text-md'>회원가입</p>
          </Link>
          <Link to="/login" className="navbar-link">
            <img src={login_icon} alt="로그인" className="menu-icon" />
            <p className='text-md'>로그인</p>
          </Link>
          {/* <Link to="/test" className="navbar-link">
            <img src={test_icon} alt="진단 테스트" className="menu-icon" />
            <p className='text-md leading-4'>진단<br />테스트</p>
          </Link> */}
          <Link to="/mypage" className="navbar-link">
            <img src={mypage_icon} alt="내 정보" className="menu-icon" />
            <p className='text-md'>내 정보</p>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
