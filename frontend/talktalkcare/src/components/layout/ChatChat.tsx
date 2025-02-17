// src/components/layout/Chatbot.tsx
import React from 'react';
import talktalk from '../../assets/talktalk.png';

const ChatChat = () => {
  return (
    <div 
    style={{
      position: 'fixed', 
      height:'100px',
      bottom: '6%',
      right: '22%',
      width:'100px',
      backgroundColor:'#c8e6c9',
      borderRadius:'50%',
      paddingTop:'3px',
      transition: 'transform 0.3s ease-in-out',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 2001,
     }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* 챗봇 아이콘 SVG 또는 이미지 */}
      <img src={ talktalk } alt="Chatbot Icon" />
    </div>
  );
};

export default ChatChat;