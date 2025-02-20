import React, { useState } from 'react';
import { User } from 'lucide-react';

interface ProfileData {
  name: string;
  age: string;
  userId: string;
  nickname: string;
  password: string;
  phone: string;
}

const ProfileEdit: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '김싸피',
    age: '64',
    userId: 'talkcare123',
    nickname: '톡톡노인',
    password: '**********',
    phone: '010-1234-1234'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API 호출 로직 구현
    //console.log('수정된 프로필:', profileData);
  };

  return (
    <div className="profile-edit-container">
      <div className="profile-header">
        <div className="profile-image-circle">
          <User size={50} color="#214005" />
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">이름:</label>
          <input
            type="text"
            name="name"
            value={profileData.name}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">나이:</label>
          <input
            type="text"
            name="age"
            value={profileData.age}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">아이디:</label>
          <input
            type="text"
            name="userId"
            value={profileData.userId}
            onChange={handleChange}
            className="form-input"
            disabled
          />
        </div>

        <div className="form-group">
          <label className="form-label">닉네임:</label>
          <input
            type="text"
            name="nickname"
            value={profileData.nickname}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">비밀번호:</label>
          <input
            type="password"
            name="password"
            value={profileData.password}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">전화번호:</label>
          <input
            type="tel"
            name="phone"
            value={profileData.phone}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <button type="submit" className="submit-button">
          정보 수정
        </button>
      </form>

      <div className="member-status">회원 탈퇴</div>
    </div>
  );
};

export default ProfileEdit;