import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../pages/Header';
import '../../styles/components/Navbar.css';
// import { Logo } from 'lucide-react';  // 로고 아이콘 임포트 (예시)

const Navbar: React.FC = () => {
 return (
   <nav className="navbar">
     <div className="navbar-top"
     style={{backgroundColor: 'black'}}>
       <div className="navbar-logo">
         <Header />
       </div>
     </div>
     <div className="navbar-middle"
     style={{backgroundColor: '#F5FFEA'}}>
       <div className="navbar-menu">
         <Link to="/signup" className="navbar-link">회원가입</Link>
         <Link to="/login" className="navbar-link">로그인</Link>
         <Link to="/test" className="navbar-link">진단 테스트</Link>
         <Link to="/mypage" className="navbar-link">내 정보</Link>
       </div>
     </div>
   </nav>
 );
};

export default Navbar;