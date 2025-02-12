import React from 'react';

interface PentagonGraphProps {
  scores: {
    순발력: number;
    논리력: number;
    기억력: number;
    사고력: number;
    집중력: number;
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
  const scorePoints = [
    scores.순발력,
    scores.논리력,
    scores.기억력,
    scores.사고력,
    scores.집중력
  ].map((score, i) => getPoint(angles[i], score));

  // 각 레벨별 오각형 좌표 생성 (5단계)
  const levelPoints = [0.2, 0.4, 0.6, 0.8, 1].map(level =>
    angles.map(angle => getPoint(angle, maxScore * level))
  );

  return (
    <div className="pentagon-graph">
      <svg width="300" height="300" viewBox="0 0 300 300">
        {/* 배경 오각형들 */}
        {levelPoints.map((points, i) => (
          <polygon
            key={i}
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* 점수 오각형 */}
        <polygon
          points={scorePoints.map(p => `${p.x},${p.y}`).join(' ')}
          fill="#4CAF50"
          fillOpacity="0.3"
          stroke="#4CAF50"
          strokeWidth="2"
        />

        {/* 라벨 */}
        {angles.map((angle, i) => {
          const labelPoint = getPoint(angle, radius * 1.2);
          const labels = ['순발력', '논리력', '기억력', '사고력', '집중력'];
          return (
            <text
              key={i}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="#666"
            >
              {labels[i]}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default PentagonGraph;