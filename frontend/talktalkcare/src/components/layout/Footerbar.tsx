import React from "react";
import '../../styles/components/Footerbar.css';
const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <nav className="footer-nav">
          <a >회사 소개</a>
          <a >이용 약관</a>
          <a >개인정보 처리방침</a>
          <a >문의하기</a>
        </nav>
        <p className="copyright">© 2025, TalkTalkcare. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
