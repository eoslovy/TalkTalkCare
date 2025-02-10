import React from 'react';

const Analytics = () => (
  <div className='font-custom text-lg'>
    <div className="p-4 bg-white rounded-xl mx-4 mb-4">
      <h2 className="text-xl font-bold mb-2">한 눈에 보는 맞춤 분석</h2>
      <p className="text-sm text-gray-600">현재 상태에 따른 개인별 맞춤 분석을 제공합니다.</p>
      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
        <img src="/api/placeholder/300/150" alt="분석 그래프" className="w-full rounded-lg" />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        분석 결과를 참고하여 톡톡케어의 맞춤 활동과 게임을 즐겨 보세요!
      </p>
    </div>
  </div>
);

export default Analytics;