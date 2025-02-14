// src/contexts/FriendListContext.tsx
import React, { createContext, useContext, useState } from 'react';

// Context 생성
const FriendListContext = createContext<{
  isFriendListOpen: boolean;
  setIsFriendListOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

// Provider 생성
export const FriendListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFriendListOpen, setIsFriendListOpen] = useState(false);

  return (
    <FriendListContext.Provider value={{ isFriendListOpen, setIsFriendListOpen }}>
      {children}
    </FriendListContext.Provider>
  );
};

// Context 사용 훅
export const useFriendList = () => {
  const context = useContext(FriendListContext);
  if (!context) {
    throw new Error('useFriendList must be used within a FriendListProvider');
  }
  return context;
};
