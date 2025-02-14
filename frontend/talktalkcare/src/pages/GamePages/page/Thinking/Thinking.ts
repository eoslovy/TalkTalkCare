import ThinkingGame1 from './ThinkingGame';
import ThinkingGame2 from './PathFindingGame';

export default [
  { id: '1',
    name: '가위바위보 생각하기',
    description: '조건에 맞는 가위바위보를 선택하세요!',
    icon: '✌️',
    skill: '사고력',
  component: ThinkingGame1 },
    { id: '2',
        name: '톡톡이의 길찾기',
        description: '톡톡이의 움직임을 기억하고 따라가세요!',
        skill: '사고력',
        icon: '🤖',
        component: ThinkingGame2 },
];
