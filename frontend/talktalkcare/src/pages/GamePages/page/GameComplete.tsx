import React from 'react';
import './GameComplete.css';

interface Reward {
  image: string;
  name: string;
}

interface GameCompleteProps {
  rewards: Reward[];
  onRestart: () => void;
  onHome: () => void;
  isForceQuit?: boolean;
  currentLevel?: number;
  completedLevel?: number;
}

const GameComplete: React.FC<GameCompleteProps> = ({ 
  rewards, 
  onRestart, 
  onHome,
  isForceQuit = false,
  currentLevel = 1,
  completedLevel = 0
}) => {
  const earnedRewards = rewards.slice(0, completedLevel);

  return (
    <div className="completion-screen">
      <h2>{isForceQuit ? "고생하셨습니다!" : "축하합니다!"}</h2>
      
      <div className="rewards">
        {earnedRewards.map((reward, index) => (
          <img 
            key={index}
            src={reward.image} 
            alt={reward.name} 
            className="reward-icon" 
          />
        ))}
      </div>

      <div className="completion-buttons">
        <button onClick={onHome}>메인으로 가기</button>
        <button onClick={onRestart}>한번 더 하기</button>
      </div>
    </div>
  );
};

export default GameComplete; 