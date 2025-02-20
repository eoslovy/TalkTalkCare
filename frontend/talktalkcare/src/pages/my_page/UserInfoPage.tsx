import React from 'react';
import { useLocation } from 'react-router-dom';
import UserInfo from '../../components/my_page/UserInfo';

const UserInfoPage = () => {
  const location = useLocation();
  const { userInfo } = location.state;


  const handleEdit = () => {
    // 정보 수정 로직 구현
    //console.log('Edit button clicked');
  };

  return (
    <div className="page-container">
      <UserInfo 
        userInfo={userInfo}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default UserInfoPage;