import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import '../../styles/components/Login.css';
import Header from '../Header';
import axios, { AxiosError } from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userLoginId: '',
    password: '',
    autoLogin: false
  });
  const [autoLogin, setAutoLogin] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.login(formData);
      console.log('전체 응답:', response); // 추가 로깅
      
      if (response.result.msg === 'success') {
        // 토큰 저장 등의 추가 로직 필요

        
        localStorage.setItem('token', response.body.userId); // 예시
        localStorage.setItem('name', response.body.username);
        localStorage.setItem('profile-image', response.body.s3Filename);
        alert('로그인 성공!');
        navigate('/');
      } else {
        alert(response.result.msg || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      // 에러 처리 로직
    }
  };

  return (
    <div className="login-container">
      <Header />
      <div className="login-form">
        {/* 로그인 입력 폼 */}
        <form onSubmit={handleLogin}>
          {/* 아이디 입력 */}
          <div className="input-group">
            <input
              type="text"
              name="userLoginId"
              value={formData.userLoginId}
              onChange={handleChange}
              placeholder="아이디"
            />
          </div>

          {/* 비밀번호 입력 */}
          <div className="input-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호"
            />
          </div>

          {/* 자동 로그인 체크박스 */}
          <div className="auto-login">
            <label>
              <input
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
              />
              <span>자동 로그인</span>
            </label>
          </div>

          {/* 로그인 버튼 */}
          <button 
            type="submit" 
            className="login-button"
            disabled={!formData.userLoginId || !formData.password}
          >
            로그인
          </button> 
        </form>

        {/* 하단 링크들 */}
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