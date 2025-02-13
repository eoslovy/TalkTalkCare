import { useState } from "react";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, GamepadIcon, FileText, User } from 'lucide-react';
import '../../styles/components/MenuItem.css';

// ✅ isFriendListOpen을 props로 받아 UI 조정
const MainMenu: React.FC<{ isFriendListOpen: boolean }> = ({ isFriendListOpen }) => {
  const navigate = useNavigate();
  

  const handleNavigation = (path: string) => {
    navigate(path);
  };
  

  return (
    <div className={`menu ${isFriendListOpen ? 'compressed' : ''}`}>
      <nav className={`menu-grid ${isFriendListOpen ? 'compressed-grid' : ''}`}>
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
          <p className="menu-item-text">치매 예방 게임</p>
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
          <p className="menu-item-text">마이 페이지</p>
        </div>
      </nav>
    </div>
  );
};

export default MainMenu;
