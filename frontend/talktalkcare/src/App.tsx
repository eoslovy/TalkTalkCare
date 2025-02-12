import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
// 경로 수정
import Keypad from './pages/keypad';
import Test from './pages/test';
import SMCQ from './pages/smcq';
import SMD from './pages/smd';
import Result from './pages/result';
import VideoCall from './pages/videocall';
import OpenViduComponent from './pages/openvidu';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <Link to="/keypad">화상통화로 이동</Link>
          <Link to="/test">치매 진단 테스트로 이동</Link>
          <Link to="/openvidu">OpenVidu 테스트</Link>
        </nav>
        <Routes>
          <Route path="/keypad" element={<Keypad />} />
          <Route path="/test" element={<Test />} />
          <Route path="/smcq" element={<SMCQ />} />
          <Route path="/smd" element={<SMD />} />
          <Route path="/result" element={<Result />} />
          <Route path="/videocall" element={<VideoCall />} />
          <Route path="/openvidu" element={<OpenViduComponent />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
