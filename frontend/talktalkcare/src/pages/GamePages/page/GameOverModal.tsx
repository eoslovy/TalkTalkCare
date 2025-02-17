import React from 'react';

interface GameOverModalProps {
  open: boolean;
  score: number;
  message?: string;
  multiplier?: number;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ 
  open, 
  score, 
  message = '시간이 종료되었습니다!',
  multiplier = 10
}) => {
  const handleGameEnd = () => {
    // 전체 페이지 새로고침
    window.location.reload();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4 text-center">게임 종료</h2>
        <p className="text-center mb-4 text-gray-600">{message}</p>
        
        <div className="text-center text-2xl font-bold my-4">
          최종 점수: {score * multiplier}점
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={handleGameEnd}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            게임 종료
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
