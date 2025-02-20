import React, { useState, useEffect, useCallback } from 'react';
import '../../../styles/components/WsGameList.css';
import { sendGameEvent as sendGameEventAPI, GameEvent } from '../../../services/gameEventService';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import logicGames from '../page/Logic/LogicalGame';
import concentrationGames from '../page/Concentration/Concentration';
import thinkingGames from '../page/Thinking/Thinking';
import quicknessGames from '../page/Quickness/Quickness';
import memoryGames from '../page/Memory/WsMemory';
interface Game {
  id: string;
  name: string;
  description: string;
  component: React.FC;
  skill: string;
  icon: string;
}

const WsGameListPage: React.FC = () => {
  const { onGameSelected } = useWebSocket();
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);

  // 전체 게임 리스트 생성
  const games: Game[] = [
    ...logicGames.map((game) => ({ ...game, skill: '논리력' })),
    ...concentrationGames.map((game) => ({ ...game, skill: '집중력' })),
    ...thinkingGames.map((game) => ({ ...game, skill: '사고력' })),
    ...quicknessGames.map((game) => ({ ...game, skill: '순발력' })),
    ...memoryGames,
  ];

  const skills = ['사고력', '집중력', '기억력', '순발력', '논리력'];

  useEffect(() => {
    const filtered = selectedSkill === 'all'
      ? games
      : games.filter((game) => game.skill.trim() === selectedSkill.trim());
    setFilteredGames(filtered);
  }, [selectedSkill]);

  useEffect(() => {
  onGameSelected((gameEvent: GameEvent) => {
    // 렌더링 사이클 이후에 업데이트하도록 지연 처리
    setTimeout(() => {
      //console.log('상대방으로부터 게임 이벤트 수신:', gameEvent);
      if (gameEvent.eventType === 'GAME_SELECTED' && gameEvent.gameId) {
        const game = games.find((g) => g.id === gameEvent.gameId);
        if (game) {
          //console.log("상대방이 선택한 게임:", game.id);
          setActiveGame(game);
        }
      }
      if (gameEvent.eventType === 'GAME_DESELECTED') {
        //console.log("상대방이 목록으로 돌아갔습니다.");
        setActiveGame(null);
      }
      if (gameEvent.eventType === 'SKILL_CHANGED' && gameEvent.payload?.selectedSkill) {
        //console.log("상대방이 변경한 스킬 필터:", gameEvent.payload.selectedSkill);
        setSelectedSkill(gameEvent.payload.selectedSkill);
      }
    }, 0);
  });
}, [games, onGameSelected]);


  const handleGameClick = useCallback((game: Game) => {
    //console.log("handleGameClick 호출됨:", game.id);
    setActiveGame(game);
    const currentUserId = Number(localStorage.getItem('userId'));
    const opponentUserId = Number(localStorage.getItem('opponentUserId'));
    const gameEvent: GameEvent = {
      eventType: 'GAME_SELECTED',
      gameId: game.id,
      senderId: currentUserId,
      opponentUserId,
    };
    //console.log("handleGameClick - 생성된 gameEvent:", gameEvent);
    sendGameEventAPI(gameEvent);
  }, []);

  const handleBackToList = () => {
    //console.log("handleBackToList 호출됨");
    setActiveGame(null);
    const currentUserId = Number(localStorage.getItem('userId'));
    const opponentUserId = Number(localStorage.getItem('opponentUserId'));
    const gameEvent: GameEvent = {
      eventType: 'GAME_DESELECTED',
      senderId: currentUserId,
      opponentUserId,
    };
    //console.log("handleBackToList - 생성된 gameEvent:", gameEvent);
    sendGameEventAPI(gameEvent);
  };

  const handleSkillFilterChange = (newSkill: string) => {
    //console.log("handleSkillFilterChange 호출됨:", newSkill);
    setSelectedSkill(newSkill);
    const currentUserId = Number(localStorage.getItem('userId'));
    const opponentUserId = Number(localStorage.getItem('opponentUserId'));
    const gameEvent: GameEvent = {
      eventType: 'SKILL_CHANGED',
      senderId: currentUserId,
      opponentUserId,
      payload: { selectedSkill: newSkill }
    };
    //console.log("handleSkillFilterChange - 생성된 gameEvent:", gameEvent);
    sendGameEventAPI(gameEvent);
  };

  return (
    <div className="ws-game-list-container">
      {activeGame ? (
        <div className="game-detail">
          <button className="back-button" onClick={handleBackToList}>⬅ 목록으로</button>
          <h2 className='middle-title'>{activeGame.name}</h2>
          <div className='small-title'>
            <p>{activeGame.icon}</p>
            <p>{activeGame.description}</p>
          </div>
          <div className="game-component">
            <activeGame.component />
          </div>
        </div>
      ) : (
        <>
          <div className="game-header">
            <h1>치매 예방 게임 목록</h1>
          </div>
          <div className="game-content-wrapper">
            <div className="skills-filter">
              <button
                className={`skill-button ${selectedSkill === 'all' ? 'active' : ''}`}
                onClick={() => handleSkillFilterChange('all')}
              >
                전체
              </button>
              {skills.map((skill) => (
                <button
                  key={skill}
                  className={`skill-button ${selectedSkill === skill ? 'active' : ''}`}
                  onClick={() => handleSkillFilterChange(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
            <div className="games-list">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className="game-card"
                  onClick={() => handleGameClick(game)}
                >
                  <div className="game-icon-container">
                    <div className="game-icon">{game.icon}</div>
                    <div className="game-name">{game.name}</div>
                  </div>
                  <div className="game-info">
                    <p>{game.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WsGameListPage;