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
     }}>
      {/* 챗봇 아이콘 SVG 또는 이미지 */}
      <img src={ talktalk } alt="Chatbot Icon" />
    </div>
  );
};

export default ChatChat;
