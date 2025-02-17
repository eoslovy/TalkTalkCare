// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import './GameList.css';

// interface Game {
//   id: string;
//   title: string;
//   description: string;
//   icon: string;
// }

// const GameList: React.FC = () => {
//   const navigate = useNavigate();

//   const games: Game[] = [
//     {
//       id: 'mole',
//       title: '두더지 잡기',
//       description: '제한 시간 내에 나타나는 두더지를 잡으세요!',
//       icon: '🦔'
//     },
//     {
//       id: 'memory',
//       title: '카드 짝 맞추기',
//       description: '카드를 뒤집어 같은 그림을 찾아 짝을 맞추세요!',
//       icon: '🎴'
//     },
//     {
//       id: 'sequence',
//       title: '순서 기억하기',
//       description: '점등되는 색상의 순서를 기억하고 따라하세요!',
//       icon: '🎨'
//     },
//     {
//       id: 'pathfinding',
//       title: '톡톡이의 길찾기',
//       description: '톡톡이의 움직임을 기억하고 따라가세요!',
//       icon: '🤖'
//     },
//     {
//       id: 'pattern',
//       title: '숫자 패턴 찾기',
//       description: '숫자의 규칙을 찾아 빈칸을 채우세요!',
//       icon: '🔢'
//     },
//     {
//       id: 'thinking',
//       title: '가위바위보 생각하기',
//       description: '조건에 맞는 가위바위보를 선택하세요!',
//       icon: '✌️'
//     },
//     {
//       id: 'colorword',
//       title: '색깔 단어 읽기',
//       description: '색깔 단어의 의미나 보이는 색상을 맞추세요!',
//       icon: '🎨'
//     }
//   ];

//   return (
//     <div className="game-list">
//       <h1>미니게임 목록</h1>
//       <div className="games-grid">
//         {games.map((game) => (
//           <div 
//             key={game.id} 
//             className="game-card"
//             onClick={() => navigate(`/game/${game.id}`)}
//           >
//             <div className="game-icon">{game.icon}</div>
//             {/* <h2>{game.title}</h2> */}
//             <p className='game-description'>{game.description}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default GameList; 