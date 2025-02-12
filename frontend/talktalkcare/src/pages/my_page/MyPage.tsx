import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import PentagonGraph from '../../components/my_page/graph/PentagonGraph';
import '../../styles/components/MyPage.css';
import Header from '../Header';
const MyPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('game');
  const [activeTestTab, setActiveTestTab] = useState('user');

  const handleUserInfoClick = () => {
    navigate('/userinfopage');
  };

  // 예시 데이터
  const gameScores = {
    순발력: 80,
    논리력: 65,
    기억력: 90,
    사고력: 75,
    집중력: 85
  };

  return (
    <div className="my-page-container">
      <Header />
      <div className="profile-section">
        <div 
          className="profile-image-container" 
          onClick={handleUserInfoClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="profile-image">
            <User size={64} />
          </div>
        </div>
        <h2 
          className="profile-title"
          onClick={handleUserInfoClick}
          style={{ cursor: 'pointer' }}
        >
          회원 정보
        </h2>
      </div>

      <div className="analysis-tabs">
        <button
          className={`tab-button ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => setActiveTab('game')}
        >
          게임 결과 분석
        </button>
        <button
          className={`tab-button ${activeTab === 'test' ? 'active' : ''}`}
          onClick={() => setActiveTab('test')}
        >
          치매 진단 테스트 결과 분석
        </button>
      </div>

      <div className="analysis-content">
        {activeTab === 'game' && (
          <div className="game-analysis">
            <h3>게임 역량별 점수</h3>
            <div className="pentagon-graph-container">
              <PentagonGraph scores={gameScores} />
            </div>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="test-analysis">
            <div className="test-tabs">
              <button
                className={`test-tab-button ${activeTestTab === 'user' ? 'active' : ''}`}
                onClick={() => setActiveTestTab('user')}
              >
                이용자
              </button>
              <button
                className={`test-tab-button ${activeTestTab === 'guardian' ? 'active' : ''}`}
                onClick={() => setActiveTestTab('guardian')}
              >
                보호자
              </button>
              <button
                className={`test-tab-button ${activeTestTab === 'summary' ? 'active' : ''}`}
                onClick={() => setActiveTestTab('summary')}
              >
                종합
              </button>
            </div>
            <div className="test-content">
              <div className="test-placeholder">테스트 결과 영역</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;