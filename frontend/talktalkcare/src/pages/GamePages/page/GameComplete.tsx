import React, { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactCanvasConfetti from 'react-canvas-confetti';
import type { CreateTypes } from 'canvas-confetti';
import './GameComplete.css';

interface GameCompleteProps {
  isForceQuit?: boolean;
  completedLevel?: number;
  onRestart?: () => void;
  previousGame?: string;
}

const GameComplete: React.FC<GameCompleteProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isForceQuit = false, completedLevel = 0, previousGame } = location.state || {};
  const refAnimationInstance = useRef<CreateTypes | null>(null);

  const getInstance = useCallback((instance: CreateTypes | null) => {
    refAnimationInstance.current = instance;
  }, []);

  const makeShot = useCallback((particleRatio: number, opts: any) => {
    refAnimationInstance.current &&
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      });
  }, []);

  const fire = useCallback(() => {
    makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    makeShot(0.2, {
      spread: 60,
    });

    makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, [makeShot]);

  // 완료 시 자동으로 폭죽 발사
  useEffect(() => {
    if (completedLevel === 3 && !isForceQuit) {
      fire();
      // 2초마다 폭죽 발사 반복
      const interval = setInterval(fire, 2000);
      // 컴포넌트 언마운트 시 인터벌 정리
      return () => clearInterval(interval);
    }
  }, [completedLevel, isForceQuit, fire]);

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
      delay: 0  // 첫 번째 메달
    },
    {
      src: '/images/silverbrain.png',
      alt: 'Silver Medal',
      level: 2,
      delay: 0.5  // 0.5초 후
    },
    {
      src: '/images/goldbrain.png',
      alt: 'Gold Medal',
      level: 3,
      delay: 1  // 1초 후
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <ReactCanvasConfetti
        refConfetti={getInstance}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 999
        }}
      />
      <main className="flex-grow flex items-center justify-center bg-gray-100 py-8">
        <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full text-center m-4">
          <h2 className={`text-2xl font-bold mb-6 ${completedLevel === 3 && !isForceQuit ? 'animate-bounce' : ''}`}>
            {isForceQuit ? "고생하셨습니다!" : 
             completedLevel === 3 ? "축하합니다! 모든 단계를 클리어하셨습니다!" : "고생하셨습니다 !"}
          </h2>
          
          <div className="my-8 flex justify-center gap-8">
            {allMedals.map((medal, index) => (
              <div 
                key={index} 
                className={`w-24 h-24 transition-all duration-500 opacity-0 scale-50
                  ${completedLevel >= medal.level ? 'animate-medal' : 'scale-90 opacity-50'}
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
                    console.error('Image failed to load:', medal.src);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handleRestart}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              다시 한번 게임하기
            </button>
            <button
              onClick={handleHome}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
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