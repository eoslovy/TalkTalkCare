import MemoryGame1 from './WsMemoryGame';
import MemoryGame2 from './SequenceMemoryGame';

export default [
  { id: 'Card-matching',
    name: '카드 짝 맞추기',
    description: '카드를 뒤집어 같은 그림을 찾아 짝을 맞추세요!',
    icon: '🎴',
    skill: '기억력',
   component: MemoryGame1 },
    { id: 'remember-the-order',
        name: '순서 기억하기',
        description: '점등되는 색상의 순서를 기억하고 따라하세요!',
        icon: '🎨',
        skill: '기억력',
        component: MemoryGame2 },
//   { id: '2', name: 'Logic Game 2', description: '논리력과 사고력을 함께 훈련하는 게임입니다.', component: LogicGame2 }
];
