import React from 'react';

interface PentagonGraphProps {
  scores: {
    [key: number]: number; // categoryId: average
  };
  maxScore?: number;
}

const PentagonGraph: React.FC<PentagonGraphProps> = ({ 
  scores, 
  maxScore = 100 
}) => {
  const center = { x: 150, y: 150 };
  const radius = 100;
  const angles = [270, 342, 54, 126, 198].map((angle) => angle * Math.PI / 180);

  // 카테고리 ID에 해당하는 레이블 매핑
  const categoryLabels: { [key: number]: string } = {
    1: '순발력',
    2: '논리력',
    3: '기억력',
    4: '사고력',
    5: '집중력'
  };

  // 각 꼭지점의 좌표 계산
  const getPoint = (angle: number, score: number) => {
    const distance = (score / maxScore) * radius;
    return {
      x: center.x + distance * Math.cos(angle),
      y: center.y + distance * Math.sin(angle)
    };
  };

  // 오각형의 외곽선 좌표
  const outerPoints = angles.map(angle => getPoint(angle, maxScore));
  
  // 실제 점수 기반의 좌표
  const scorePoints = [1, 2, 3, 4, 5].map((categoryId, i) => 
    getPoint(angles[i], scores[categoryId] || 0)
  );

  // 각 레벨별 오각형 좌표 생성 (5단계)
  const levelPoints = [0.2, 0.4, 0.6, 0.8, 1].map(level =>
    angles.map(angle => getPoint(angle, maxScore * level))
  );

  return (
    <div className="pentagon-graph">
      <svg width="400" height="400" viewBox="-50 -50 400 400">
        {/* 배경 오각형들 */}
        {levelPoints.map((points, i) => (
          <polygon
            key={i}
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#214005"
            strokeWidth="3"
          />
        ))}

        {/* 점수 오각형 */}
        <polygon
          points={scorePoints.map(p => `${p.x},${p.y}`).join(' ')}
          fill="#4CAF50"
          fillOpacity="0.3"
          stroke="#4CAF50"
          strokeWidth="1"
        />

        {/* 라벨 */}
        {angles.map((angle, i) => {
          const labelPoint = getPoint(angle, radius * 1.4);
          const categoryId = i + 1;
          return (
            <text
              key={i}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="20"
              fill="#214005"
            >
              {categoryLabels[categoryId]}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default PentagonGraph;