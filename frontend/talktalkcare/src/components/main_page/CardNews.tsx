import React, { useState, useEffect } from "react";
import '../../styles/components/CardNews.css'

const images = [
    { 
      image: "/images/news1.jpg", 
      title: "톡톡이와 대화", 
      description: "무엇이든 함께 이야기 해주는 똑똑한 톡톡이와 대화해 보세요." 
    },
    { 
      image: "/images/news2.jpg", 
      title: "함께 즐기는 치매 예방", 
      description: "혼자서도 할 수 있지만, 가족이나 친구들과 함께 즐기면 더욱 효과적입니다." 
    },
    { 
      image: "/images/news3.jpg", 
      title: "소통의 도구, 톡톡케어", 
      description: "함께 게임을 하며 웃고 대화하는 것 자체가 최고의 치매 예방법입니다." 
    },
    { 
      image: "/images/news4.jpg", 
      title: "재밌게 하는 두뇌 운동", 
      description: "톡톡케어는 다양한 인지 기능을 강화할 수 있는 게임들을 제공합니다." 
    },
  ];

// ✅ isFriendListOpen을 props로 받아 크기 조정
const CardNews: React.FC<{ isFriendListOpen: boolean }> = ({ isFriendListOpen }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 자동 슬라이드 (4초마다 변경)
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // 다음 슬라이드
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // 이전 슬라이드
  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className={`card-news-container ${isFriendListOpen ? 'compressed' : ''}`}>
      {/* 이미지 */}
      <img 
        src={images[currentIndex].image} 
        alt={images[currentIndex].title} 
        className="card-news-img"
      />

      {/* 제목 및 설명 */}
      <div className="news-text absolute bottom-7 left-5 bg-opacity-50 p-4 rounded-lg" style={{ color: "#214005" }}>
        <h2 className="card-title-box text-xl font-bold">{images[currentIndex].title}</h2>
        <p className="card-content text-sm">{images[currentIndex].description}</p>
      </div>

        {/* 이전 버튼 */}
        <button
          onClick={prevSlide}
          className="prev-btn">
          {/* &#8249; */}
          <p className="btn">◀</p>
        </button>

        {/* 다음 버튼 */}
        <button
          onClick={nextSlide}
          className="next-btn">
          {/* &#8250; */}
          <p className="btn">▶</p>
        </button>

        {/* 인디케이터 (슬라이드 위치 표시) */}
        <div className="indicator-container absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <span
              key={index}
              className={`indicator-dot ${index === currentIndex ? "active" : ""}`}
            ></span>
          ))}
      </div>
    </div>
  );
};

export default CardNews;
