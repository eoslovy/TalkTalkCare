import React, { useState } from 'react';
import '../../styles/components/GameList.css';

interface Game {
  id: string;
  name: string;
  description: string;
  skills: string[];
}

const GameListPage = () => {
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  
  const games: Game[] = [
    {
      id: '1',
      name: 'OO게임',
      description: '게임 설명 ~~~~~~~~~~',
      skills: ['사고력', '집중력']
    },
    {
      id: '2',
      name: 'OO게임',
      description: '게임 설명 ~~~~~~~~~~',
      skills: ['기억력', '논리력']
    },
    {
      id: '3',
      name: 'OO게임',
      description: '게임 설명 ~~~~~~~~~~',
      skills: ['순발력', '논리력']
    }
  ];

  const skills = ['사고력', '집중력', '기억력', '순발력', '논리력'];

  return (
    <div className="game-list-container">
      <div className="game-header">
        <h1>치매 예방 게임 목록</h1>
      </div>

      <div className="game-content-wrapper">
        <div className="skills-filter">
          {skills.map((skill) => (
            <button
              key={skill}
              className={`skill-button ${selectedSkill === skill ? 'active' : ''}`}
              onClick={() => setSelectedSkill(skill)}
            >
              {skill}
            </button>
          ))}
        </div>

        <div className="games-list">  {/* grid에서 list로 클래스명 변경 */}
          {games.map((game) => (
            <div key={game.id} className="game-card">
              <div className="game-icon">
                {game.name}
              </div>
              <div className="game-info">
                <h3>{game.name}</h3>
                <p>{game.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameListPage;
