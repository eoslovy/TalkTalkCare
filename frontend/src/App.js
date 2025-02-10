import React, { useEffect, useState, useRef } from 'react';
import LoginForm from './components/LoginForm';
import FriendList from './components/FriendList/FriendList.tsx';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  const isInitialMount = useRef(true);

  // 환경변수 확인을 위한 디버깅 코드
  useEffect(() => {
    console.log('API_BASE_URL:', API_BASE_URL);
  }, [API_BASE_URL]);

  useEffect(() => {
    let isSubscribed = true;

    const autoLogin = async () => {
      if (!API_BASE_URL || !isInitialMount.current) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/auto-login`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (isSubscribed && data.result && data.result.msg === 'success') {
          setUser(data.body);
        }
      } catch (error) {
        console.error('자동 로그인 실패:', error);
      } finally {
        isInitialMount.current = false;
      }
    };

    autoLogin();

    return () => {
      isSubscribed = false;
    };
  }, [API_BASE_URL]);

  const handleLogin = async (loginData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.result && data.result.msg === 'success') {
        setUser(data.body);
      } else {
        alert(data.result?.msg || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 요청 실패:', error);
      alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // // 모든 관련 쿠키 삭제
      // document.cookie = 'JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // document.cookie = 'remember-me-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // document.cookie = 'remember-me-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // 유저 정보 초기화
      setUser(null);
      
      // 웹소켓은 FriendList 컴포넌트가 언마운트되면서 자동으로 종료됨
      
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="App">
      {user ? (
        <div className="main-container">
          <header className="header">
            <div className="user-info">
              <h2>환영합니다, {user.username}님!</h2>
              {user.s3Filename && (
                <img 
                  src={`${user.s3Filename}`}
                  alt="프로필 이미지" 
                  className="profile-image"
                />
              )}
              <button 
                onClick={handleLogout}
                className="logout-button"
              >
                로그아웃
              </button>
            </div>
          </header>
          <main className="content">
            <FriendList userId={user.userId} />
          </main>
        </div>
      ) : (
        <div className="login-container">
          <h1>Talk Talk Care</h1>
          <LoginForm onLogin={handleLogin} />
        </div>
      )}
    </div>
  );
}

export default React.memo(App);
