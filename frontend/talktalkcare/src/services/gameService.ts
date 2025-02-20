import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const gameService = {
  saveGameResult: async (userId: number, gameId: number, score: number) => {
    try {
      const data = {
        userId,
        gameId,
        score
      };

      //console.log('전송 데이터:', data); // 전송 데이터 콘솔 출력

      const response = await axios.post(`${BASE_URL}/games/save-result`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      //console.log('응답 데이터:', response.data); // 응답 데이터 콘솔 출력

      return response.data;
    } catch (error) {
      //console.error('게임 결과 저장 실패:', error);
      throw error;
    }
  }
};