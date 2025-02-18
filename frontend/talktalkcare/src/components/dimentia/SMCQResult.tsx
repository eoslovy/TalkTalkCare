import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import '../../styles/components/Result.css';
import LoadingModal from '../LoadingModal'

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log(import.meta.env.VITE_API_BASE_URL);

// 상태 타입 정의
interface LocationState {
    answers: string[];
    testType?: string;
}

const Result: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;
    const answers = state?.answers || [];
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [aiAnalysisMessage, setAiAnalysisMessage] = useState(""); 
    
    // 로컬 스토리지에서 로그인된 사용자 정보 가져오기
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        setIsLoggedIn(Boolean(token && userId));
    }, []);
    
    // AI 분석 결과 상태
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

    // 결과 계산 함수
    const calculateResult = () => {
        return answers.filter(answer => answer === '예').length;
    };

    // AI 분석 결과 요청 함수
    const fetchAiAnalysis = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
    
        try {
            setIsLoading(true);  // Start loading
            const url = new URL(`${BASE_URL}/dementia-test/analysis`);
            url.searchParams.append('userId', userId);
            url.searchParams.append('requestType', '1');
    
            const response = await fetch(url, { 
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
    
            // 응답 없으면 메세지
            if (!response.ok) {
                console.warn("📌 검사 횟수가 1회뿐이므로 AI 분석이 불가능합니다.");
                setAiAnalysisMessage("AI 분석 결과를 제공하려면 최소 2번의 검사가 필요합니다. \n다음 검사 후 결과를 확인할 수 있습니다. \n톡톡케어의 게임을 먼저 즐겨주세요!");
                return;
            }
            
            const data = await response.json();
            console.log("📌 백엔드 응답:", data);

            if (data?.body) {
                setAiAnalysis(data.body);
            } else {
                console.error("📌 예상과 다른 응답 구조:", data);
            }  
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="result-container">
            {isLoading && <LoadingModal />}

            <div className="content-section">
                <h2 className='result-title'>치매진단<br />테스트 결과</h2>
                
                <div className="result-box-wrapper">
                    <div className="result-box">
                        <div className="result-content">
                            <p>총 {answers.length}문항 중 {calculateResult()}개의 항목에서 치매 위험이 감지되었습니다.</p>
                        </div>
                        <div className='result-notice'>
                            <p className='notice'>자가 치매 진단을 위해 시행하는 SMCQ 테스트는<br /> 6개 이상 항목에서
                            치매 위험이 감지될 때,<br /> 주의가 필요하다고 판단합니다.</p>
                        </div>
                    </div>
                </div>
                
                <div className="button-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                    {isLoggedIn ? (
                        <>
                            {state?.testType === 'SMCQ' && (

                            <button 
                                className="ai-analysis-button" 
                                onClick={fetchAiAnalysis}
                                disabled={isLoading}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '200px', height: '50px', textAlign: 'center', flex: '1 1 45%' }}
                            >
                                {isLoading ? '분석 중...' : 'AI 분석 보기'}
                            </button>
                            )}
                            <Link to="/game" className="game-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '200px', height: '50px', textAlign: 'center', flex: '1 1 45%' }}>
                                게임 하러가기
                            </Link>
                        </>
                    ) : (
                        <>
                            <p style={{ width: '100%', textAlign: 'center' }}>
                                회원가입을 통해 톡톡케어의 서비스를 이용해보세요!
                            </p>
                            <button 
                                onClick={() => navigate('/login')}
                                className="login-button-1" 
                                // style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '200px', height: '50px', textAlign: 'center', flex: '1 1 45%', backgroundColor:'#f8fff8' }}
                            >
                                로그인
                            </button>
                            
                            <button 
                                onClick={() => navigate('/sign-up')}
                                className="signup-button-1" 
                                // style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '200px', height: '50px', textAlign: 'center', flex: '1 1 45%', backgroundColor:'#f8fff8' }}
                            >
                                회원가입
                            </button>
                        </>
                    )}
                </div>
                
                {isLoggedIn && aiAnalysis && (
                    <div className="ai-analysis-result" style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', wordBreak: 'break-word' }}>
                        <h3>AI 분석 결과</h3>
                        <p>{aiAnalysis}</p>
                    </div>
                )}
                <div>
                {aiAnalysisMessage && <p className="ai-analysis-result">
                        {aiAnalysisMessage.split("\n").map((line, index) => (
                            <span key={index}>
                                {line}
                                <br />
                            </span>
                        ))}
                    </p>
                }
                </div>
            </div>
        </div>
    );
};

export default Result;