// src/routes/Router.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import MainPage from '../pages/MainPage.tsx';
import KeyPad from '../pages/call_page/KeyPad.tsx';
import GameListPage from '../pages/GamePages/GameListPage.tsx';
import MyPage from '../pages/my_page/MyPage.tsx';
import UserInfoPage from '../pages/my_page/UserInfoPage.tsx';
import Test from '../pages/DimentiaTest/test.tsx';
import Result from '../pages/DimentiaTest/Result.tsx';
import SMCQResult from '../components/dimentia/SMCQResult.tsx';
import SDQResult from '../components/dimentia/SDQResult.tsx';
import SDQ from '../pages/DimentiaTest/test_page/SDQ.tsx';
import SMCQ from '../pages/DimentiaTest/test_page/SMCQ.tsx';
import SignUp from '../pages/user_page/SignUp.tsx';
import Login from '../pages/user_page/LoginPage.tsx';
import TalkTalkChat from '../pages/TalkTalkAi.tsx/TalkTalk.tsx';
import OpenViduComponent from '../pages/call_page/openvidu.tsx';
// import Login from '../pages/user_page/LoginPage.tsx';
import ChatChat from '../components/layout/ChatChat.tsx';
import { FriendListProvider } from '../contexts/FriendListContext.tsx'; // FriendListProvider 임포트
import ProfileEdit from '../pages/user_page/UserUpdate.tsx';
import { AuthProvider } from '../contexts/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FriendListProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<MainPage />} />
              <Route path="/call" element={<KeyPad />} />
              <Route path="/game" element={<GameListPage />} />
              <Route path="/test" element={<Test />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/userinfopage" element={<UserInfoPage />} />
              <Route path="/sdq" element={<SDQ />} />
              <Route path="/smcq" element={<SMCQ />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/result" element={<Result />} />
              <Route path="/talktalk" element={<TalkTalkChat />} />
              <Route path="/videocall" element={<OpenViduComponent />} />
              <Route path="/chat" element={<ChatChat />} />
              <Route path="/update" element={<ProfileEdit />} />
            </Route>
          </Routes>
        </FriendListProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;