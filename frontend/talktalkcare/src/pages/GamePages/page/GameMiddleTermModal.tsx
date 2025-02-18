import React, { useState } from 'react';
import CustomModal from '../../../components/CustomModal';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface GameMiddleTermModalProps {
  open: boolean;
  stage: number;
  timeLeft: number;
  stageResults: { stage: number; timeLeft: number; }[];
  message: string;
  onNext?: () => void;
  onExit: () => void;
}

const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
const [modalMessage, setModalMessage] = useState<string>('');

const GameMiddleTermModal: React.FC<GameMiddleTermModalProps> = ({ 
  open, 
  stage,
  timeLeft,
  stageResults,
  message,
  onNext,
  onExit
}) => {
  const calculateScore = () => {
    return stageResults.reduce((acc, result) => {
      const stageConfig = {
        1: { time: 60 },
        2: { time: 40 },
        3: { time: 30 }
      };
      
      // 기본 점수 계산 (스테이지 * 10)
      const baseScore = result.stage * 10;
      
      // 시간 보너스 계산 (남은 시간 비율에 따른 기본 점수의 추가 점수)
      const timePercentage = (result.timeLeft / stageConfig[result.stage as keyof typeof stageConfig].time);
      const bonusScore = baseScore * timePercentage;
      
      // 기본 점수 + 보너스 점수
      return acc + baseScore + bonusScore;
    }, 0);
  };

  const handleExit = async () => {
      const score = Math.round(calculateScore());
      const response = await fetch(`${BASE_URL}/games/save-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          gameId: 2,
          score: score
        })
      });

      const data = await response.json();

      if(data.result.msg !== 'success')  {
        setModalMessage(data.result.msg || '게임 결과 저장에 실패 했습니다다.');
        setIsModalOpen(true);
      }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4 text-center">축하합니다!</h2>
        <p className="text-center mb-4 text-gray-600">{message}</p>
        
        <div className="text-center text-2xl font-bold my-4">
          현재 단계: {stage}단계<br />
          남은 시간: {timeLeft}초
        </div>
        
        <div className="flex justify-center gap-4">
          {onNext && (
            <button 
              onClick={onNext}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              다음 단계 도전하기
            </button>
          )}
          <button 
            onClick={handleExit}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            그만 하기
          </button>
        </div>
      </div>
      <CustomModal
      title="알림"
      message={modalMessage}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default GameMiddleTermModal;
