import React from 'react';
import '../styles/components/LoadingModal.css'; // 스타일 파일 추가
import loadingGif from '../assets/loading.gif';

const LoadingModal: React.FC = () => {
  return (
    <div className="loading-modal">
      <div className="loading-content">
        <img src={loadingGif} alt="로딩중.." className='loading-image'/>
        {/* <div className="spinner"></div> */}
        <p className='loading-text'>로딩 중입니다...</p>
      </div>
    </div>
  );
};

export default LoadingModal;
