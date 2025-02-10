import { useState } from 'react';

function LoginForm({ onLogin }) {
  const [userLoginId, setUserLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ userLoginId, password, autoLogin });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={userLoginId}
        onChange={(e) => setUserLoginId(e.target.value)}
        placeholder="사용자 아이디"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        required
      />
      <label>
        <input
          type="checkbox"
          checked={autoLogin}
          onChange={(e) => setAutoLogin(e.target.checked)}
        />
        자동 로그인
      </label>
      <button type="submit">로그인</button>
    </form>
  );
}

export default LoginForm;