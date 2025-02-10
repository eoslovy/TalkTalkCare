import React, { useState, useRef } from 'react';
import { User, Camera } from 'lucide-react';
import '../../styles/components/UserInfo.css';
import Header from '../../pages/Header';
interface UserInfoProps {
  userInfo: {
    name: string;
    age: number;
    id: string;
    nickname: string;
    phone: string;
  };
  onEdit?: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({ userInfo, onEdit }) => {
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = () => {
    console.log('Sign out clicked');
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="user-info-container">
      <Header />
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
          <div className="camera-icon">
            <Camera size={20} />
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <h2 className="profile-title">사진 업로드</h2>
      </div>


      <div className="info-card">
        {/* 정보 행들 먼저 배치 */}
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
            <span className="info-value">{userInfo.id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">닉네임:</span>
            <span className="info-value">{userInfo.nickname}</span>
          </div>
          <div className="info-row">
            <span className="info-label">비밀번호:</span>
            <span className="info-value">***********</span>
          </div>
          <div className="info-row" style={{ marginBottom: '0' }}>  {/* 마지막 info-row의 margin-bottom 제거 */}
            <span className="info-label">전화번호:</span>
            <span className="info-value">{userInfo.phone}</span>
          </div>
        {/* 버튼들을 마지막에 배치 */}
        <div className="button-container">
          <button className="edit-button" onClick={onEdit}>
            정보 수정
          </button>
          <button className="signout-button" onClick={handleSignOut}>
            회원탈퇴
          </button>
        </div>
        </div>

      </div>
    </div>
  );
};

export default UserInfo;