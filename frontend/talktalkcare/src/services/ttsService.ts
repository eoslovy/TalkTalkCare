// import axios from 'axios';

// const TTS_API_URL = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';

// export const ttsService = {
//   textToSpeech: async (text: string) => {
//     try {
//       const response = await axios({
//         method: 'post',
//         url: TTS_API_URL,
//         headers: {
//           'X-NCP-APIGW-API-KEY-ID': import.meta.env.VITE_NCP_CLIENT_ID,
//           'X-NCP-APIGW-API-KEY': import.meta.env.VITE_NCP_CLIENT_SECRET,
//           'Content-Type': 'application/x-www-form-urlencoded'
//         },
//         data: new URLSearchParams({
//           speaker: 'nara', // 여성 화자
//           text: text,
//           volume: '0',  // 기본 볼륨
//           speed: '0',   // 기본 속도
//           pitch: '0',   // 기본 높낮이
//           format: 'mp3' // MP3 포맷 설정
//         }),
//         responseType: 'arraybuffer' // 바이너리 데이터로 응답 받음
//       });

//       // 음성 데이터를 재생
//       const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
//       const audioUrl = URL.createObjectURL(audioBlob);
//       const audio = new Audio(audioUrl);
//       audio.play();

//     } catch (error) {
//       //console.error('❌ TTS 변환 실패:', error);
//       await fallbackTextToSpeech(text);
//     }
//   }
// };

// // 폴백 음성 합성 메서드
// const fallbackTextToSpeech = async (text: string) => {
//   if ('speechSynthesis' in window) {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = 'ko-KR';
//     window.speechSynthesis.speak(utterance);
//   } else {
//     console.warn('❌ 음성 합성을 지원하지 않는 브라우저입니다.');
//   }
// };