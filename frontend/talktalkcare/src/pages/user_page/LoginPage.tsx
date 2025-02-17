import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import '../../styles/components/Login.css';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn, setUserName } = useAuth(); // 디스트럭처링 변경
  const [formData, setFormData] = useState({
    userLoginId: '',
    password: '',
    autoLogin: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.login(formData);
      
      if (response.result.msg === 'success') {
        localStorage.setItem('userId', response.body.userId);
        localStorage.setItem('name', response.body.username);
        localStorage.setItem('profile-image', response.body.s3Filename);
        localStorage.setItem('token', response.body.token);
  
        setIsLoggedIn(true);
        setUserName(response.body.username);
     
        alert('로그인 성공!');
      } else {
        alert(response.result.msg || '로그인에 실패했습니다.');
      }
      // 로그인 성공 여부와 관계없이 메인 페이지로 이동
      navigate('/', { replace: true });
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인 중 오류가 발생했습니다.');
      // 에러가 발생해도 메인 페이지로 이동
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              name="userLoginId"
              value={formData.userLoginId}
              onChange={handleChange}
              placeholder="아이디"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호"
            />
          </div>

          <div className="auto-login">
            <label>
              <input
                type="checkbox"
                name="autoLogin"
                checked={formData.autoLogin}
                onChange={handleChange}
              />
              <span>자동 로그인</span>
            </label>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={!formData.userLoginId || !formData.password}
          >
            로그인
          </button>
        </form>

        <div className="bottom-links">
          <span onClick={() => navigate('/find-id')}>아이디 찾기</span>
          <span className="divider">|</span>
          <span onClick={() => navigate('/find-password')}>비밀번호 찾기</span>
          <span className="divider">|</span>
          <span onClick={() => navigate('/signup')}>회원가입</span>
        </div>
      </div>
    </div>
  );
};

export default Login;