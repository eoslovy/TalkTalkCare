const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface GameEvent {
  eventType: string;
  gameId?: string;
  senderId: number;
  opponentUserId: number;
  payload?: { [key: string]: any };
}

export const sendGameEvent = async (event: GameEvent): Promise<void> => {
  //console.log("게임 이벤트 AaPI 호출:", event);
  try {
    const response = await fetch(`${BASE_URL}/games/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      credentials: 'include',
    });
    if (!response.ok) {
      //console.error('게임 이벤트 전송 실패:', response.status);
    } else {
      //console.log("게임 이벤트 전송 성공");
    }
  } catch (error) {
    //console.error('게임 이벤트 전송 중 에러:', error);
  }
};

export { sendGameEvent as sendGameEventAPI };
