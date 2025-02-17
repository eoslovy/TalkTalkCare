import React from 'react';
import UserInfo from '../../components/my_page/UserInfo';
// import Header from '../Header';

const UserInfoPage = () => {
  const mockUserInfo = {
    name: '김싸피',
    age: 64,
    id: 'talkcare123',
    nickname: '똑똑노인',
    phone: '010-1234-1234',
  };

  const handleEdit = () => {
    // 정보 수정 로직 구현
    console.log('Edit button clicked');
  };

  return (
    <div className="page-container">
      <UserInfo 
        userInfo={mockUserInfo}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default UserInfoPage;