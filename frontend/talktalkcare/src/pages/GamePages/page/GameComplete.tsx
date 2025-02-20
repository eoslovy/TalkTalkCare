import React, { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactCanvasConfetti from 'react-canvas-confetti';
import type { CreateTypes } from 'canvas-confetti';
import './GameComplete.css';
import successGif from '../../../assets/success.gif';

interface GameCompleteProps {
  isForceQuit?: boolean;
  completedLevel?: number;
  onRestart?: () => void;
  previousGame?: string;
}

const GameComplete: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { previousGame } = location.state || {};
  // 항상 레벨 3으로 설정
  const completedLevel = 3;
  // 항상 false로 설정
  const isForceQuit = false;

  const handleRestart = () => {
    navigate('/game', { 
      state: { 
        gameId: previousGame, 
      } 
    });
  };

  const handleHome = () => {
    navigate('/game');
  };

  const allMedals = [
    {
      src: '/images/bronzebrain.png',
      alt: 'Bronze Medal',
      level: 1,
      delay: 0
    },
    {
      src: '/images/silverbrain.png',
      alt: 'Silver Medal',
      level: 2,
      delay: 0.5
    },
    {
      src: '/images/goldbrain.png',
      alt: 'Gold Medal',
      level: 3,
      delay: 1
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center py-8">
        <div className="complete-container rounded-lg p-12 shadow-xl max-w-2xl w-full text-center m-4">
        <h2 className="text-3xl font-bold mb-2 animate-bounce">
            축하합니다! 모든 단계를 클리어하셨습니다!
          </h2>
          
          <div className=" flex justify-center gap-16">
            {allMedals
              .filter(medal => medal.level <= completedLevel)
              .map((medal, index) => (
                <div 
                  key={index} 
                  className={`w-20 h-20 transition-all duration-500 opacity-0 scale-50
                    animate-medal
                  `}
                  style={{
                    animationDelay: `${medal.delay}s`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <img 
                    src={medal.src}
                    alt={medal.alt}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      //console.error('Image failed to load:', medal.src);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
            ))}
          </div>

          <div>
            <img src={successGif} alt="성공" className='success-img'/>
          </div>

          <div className="flex justify-center gap-6 mt-8">
            <button
              onClick={handleRestart}
              className="game-control-button restart"
            >
              다시 한번 게임하기
            </button>
            <button
              onClick={handleHome}
              className="game-control-button restart"
            >
              목록으로 나가기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameComplete;