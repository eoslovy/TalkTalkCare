// src/components/Header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  className?: string;  // className을 optional prop으로 정의
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const navigate = useNavigate();

  return (
    <header className={className}>
      <div className="header-content">
        
      </div>
    </header>
  );
};

export default Header;