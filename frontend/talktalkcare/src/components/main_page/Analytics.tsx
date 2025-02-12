import React from 'react';
import radar_grape from '../../assets/radar_chart.png'
import '../../styles/components/Analytics.css'

const Analytics = () => (
  <div className='card-box flex flex-col items-center justify-center'>
    <p className="text-4xl mb-2 px-45">한 눈에 보는 맞춤 분석</p>
    <p className="text-lg text-gray-600 px-40">현재 상태에 따른 개인별 맞춤 분석을 제공합니다.</p>
    <div className="flex justify-center items-center mt-4 w-170">
      <img src={radar_grape} alt="분석 그래프" className="w-1/2 rounded-lg pl-40" />
      <p className="text-kg text-gray-500 ml-4 w-1/2 px-3">
        분석 결과를 참고하여 <br /> 톡톡케어의 맞춤 활동과<br />게임을 즐겨 보세요!
      </p>
    </div>
  </div>
);

export default Analytics;
