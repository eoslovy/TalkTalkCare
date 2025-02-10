import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, GamepadIcon, FileText, User } from 'lucide-react';
import Header from '../../pages/Header';
import '../../styles/components/MenuItem.css';

const MainMenu: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="menu">
      <Header />
      <nav className="menu-grid">
        <div onClick={() => handleNavigation('/call')} className="menu-item">
          <div className="menu-item-icon">
            <Phone size={40} />
          </div>
          <p className="menu-item-text">통화하기</p>
        </div>

        <div onClick={() => handleNavigation('/game')} className="menu-item">
          <div className="menu-item-icon">
            <GamepadIcon size={40} />
          </div>
          <p className="menu-item-text">게임하기</p>
        </div>

        <div onClick={() => handleNavigation('/test')} className="menu-item">
          <div className="menu-item-icon">
            <FileText size={40} />
          </div>
          <p className="menu-item-text">치매 진단<br />테스트</p>
        </div>

        <div onClick={() => handleNavigation('/mypage')} className="menu-item">
          <div className="menu-item-icon">
            <User size={40} />
          </div>
          <p className="menu-item-text">마이페이지</p>
        </div>
      </nav>
    </div>
  );
};

export default MainMenu;
