import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../../styles/components/Result.css';
import SMCQResult from '../../components/dimentia/SMCQResult';
import SDQResult from '../../components/dimentia/SDQResult';

const ResultPage: React.FC = () => {
  const location = useLocation();
  const testType = location.state?.testType || 'SMCQ'; // 기본값 SMCQ

  return (
      <div className="result-page">
          {/* SMCQ 또는 SDQ 결과 페이지 렌더링 */}
          {testType === 'SMCQ' ? <SMCQResult /> : <SDQResult />}
      </div>
  );
};
  
  export default ResultPage;


