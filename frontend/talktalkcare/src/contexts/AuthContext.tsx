import { createContext, useState, useContext, useEffect } from 'react';
import React from 'react';
import { authService } from '../services/authService';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  userName: string;
  setUserName: (userName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  userName: '',
  setUserName: () => {},
  logout: () => {}
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    // 새로고침해도 유지되도록 localStorage 활용
    return !!localStorage.getItem('token');
  });

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('name') || '';
  });

  const logout = async () => {
    try {
      // 실제 로그아웃 API 호출
      await authService.logout();

      // 로컬 스토리지 초기화
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('name');
      localStorage.removeItem('profile-image');

      // 상태 업데이트
      setIsLoggedIn(false);
      setUserName('');
    } catch (error) {
      //console.error('로그아웃 실패:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      setIsLoggedIn, 
      userName, 
      setUserName,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };