import React, { useState, useEffect, useRef } from 'react';
import { User, Camera } from 'lucide-react';
import '../../styles/components/UserInfo.css';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UserInfoProps {
  userInfo: {
    name: string;
    age: number;
    loginId: string;
    phone: string;
    s3Filename?: string;
  };
  onEdit?: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({ userInfo, onEdit }) => {
  const [image, setImage] = useState<string | null>(userInfo.s3Filename || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 로컬 스토리지에서 로그인된 사용자 정보 가져오기
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      setIsLoggedIn(Boolean(token && userId));
  }, []);

  useEffect(() => {
    setImage(userInfo.s3Filename || null);
  }, [userInfo.s3Filename]);

  const handleSignOut = () => {
    console.log('Sign out clicked');
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const uploadImage = async (file: File) => {
    if (!userId) {
      console.error('사용자 ID를 찾을 수 없습니다.');
      return;
    }

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('file', file);

    try {
      const response = await fetch(`${BASE_URL}/users/upload-profile`, {
        method: 'POST',
        body: formData,
        // 필요한 경우 인증 토큰 추가
        // headers: {
        //   'Authorization': `Bearer ${localStorage.getItem('token')}`
        // }
      });

      if (!response.ok) {
        throw new Error('이미지 업로드 실패');
      }

      const data = await response.json();

      if (data.result.msg === 'success') {
        return data.body.imageUrl;
      } else {
        throw new Error(data.result.errorCode || '이미지 업로드 실패');
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw error;
    }
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await uploadImage(file);
        setImage(imageUrl);
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        // 여기에 사용자에게 에러 메시지를 보여주는 로직을 추가할 수 있습니다.
      }
    }
  };

  return (
    <div className="user-info-container">
      <div className="profile-header">
        <div 
          className="profile-image-container" 
          onClick={handleImageClick}
          style={{ cursor: 'pointer' }}
        >
          {image ? (
            <img 
              src={image} 
              alt="프로필" 
              className="profile-image"
            />
          ) : (
            <div className="profile-image-placeholder">
              <User size={64} />
            </div>
          )}
          
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>

      <div className="info-card">
        <div className="info-rows">
          <div className="info-row">
            <span className="info-label">이름:</span>
            <span className="info-value">{userInfo.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">나이:</span>
            <span className="info-value">{userInfo.age}세</span>
          </div>
          <div className="info-row">
            <span className="info-label">아이디:</span>
            <span className="info-value">{userInfo.loginId}</span>
          </div>
          <div className="info-row" style={{ marginBottom: '0' }}>
            <span className="info-label">전화번호:</span>
            <span className="info-value">{userInfo.phone}</span>
          </div>
        </div>
        
        <div className="button-container">
          <button className="edit-button" onClick={onEdit}>
            정보 수정
          </button>
        </div>
      </div>

      {/* 회원 탈퇴 버튼을 info-card 아래 오른쪽 정렬 */}
      <div className="signout-container">
        <button className="signout-button" onClick={handleSignOut}>
          회원 탈퇴
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
