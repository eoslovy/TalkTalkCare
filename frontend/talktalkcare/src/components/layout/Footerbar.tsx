import React from "react";
import '../../styles/components/Footerbar.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <nav className="footer-nav">
          <a href="#">회사 소개</a>
          <a href="#">이용 약관</a>
          <a href="#">개인정보 처리방침</a>
          <a href="#">문의하기</a>
        </nav>
        <div className="footer-info">
          <div className="company-info">
            <p>톡톡케어</p>
            <p>서울특별시 강남구 테헤란로 212</p>
            {/* <p>대표이사: 김싸피</p> */}
            <p className="email">E-mail: talktalkcarel@ssafy.ac.kr</p>
          </div>
          <div className="contact-info">
            <p>고객센터: 1544-9001</p>
            <p>평일: 09:00 ~ 18:00</p>
            <p>점심시간: 12:00~13:00</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="copyright">© 2025, TalkTalkcare. All rights reserved.</p>
          {/* <p className="company">Ping's corp.</p> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
