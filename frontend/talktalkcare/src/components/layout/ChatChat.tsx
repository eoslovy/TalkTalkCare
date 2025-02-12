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
      backgroundColor:'#f5ffea',
      borderRadius:'50%',
      border : '1px solid lightgray'
     }}>
      {/* 챗봇 아이콘 SVG 또는 이미지 */}
      <img src={ talktalk } alt="Chatbot Icon" />
    </div>
  );
};

export default ChatChat;
