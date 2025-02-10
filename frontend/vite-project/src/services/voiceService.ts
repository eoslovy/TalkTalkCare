import AWS from 'aws-sdk';

export const ttsService = {
  textToSpeech: async (text: string): Promise<void> => {
    try {
      // Polly 인스턴스 생성
      const polly = new AWS.Polly({ apiVersion: '2016-06-10' });

      const params: AWS.Polly.SynthesizeSpeechInput = {
        Text: text,
        OutputFormat: 'mp3',
        VoiceId: 'Seoyeon',
        Engine: 'neural'
      };

      // 음성 합성 요청
      const result = await polly.synthesizeSpeech(params).promise();

      // 명시적 null 체크
      if (!result.AudioStream) {
        throw new Error('오디오 스트림이 존재하지 않습니다.');
      }

      // ArrayBuffer로 변환
      const audioBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        // AudioStream을 Uint8Array로 변환
        const audioData = new Uint8Array(result.AudioStream as ArrayBuffer);
        
        const reader = new FileReader();
        const blob = new Blob([audioData], { type: 'audio/mp3' });
        
        reader.onloadend = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(reader.result);
          } else {
            reject(new Error('ArrayBuffer 변환 실패'));
          }
        };
        
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      // 오디오 재생
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      
      return new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };

        audio.play();
      });

    } catch (error) {
      console.error('❌ AWS Polly 음성 변환 오류:', error);
      return fallbackTextToSpeech(text);
    }
  }
};

// 폴백 음성 합성 메서드
const fallbackTextToSpeech = async (text: string): Promise<void> => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';

    return new Promise<void>((resolve) => {
      utterance.onend = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  } else {
    console.warn('⚠️ 음성 합성을 지원하지 않는 브라우저입니다.');
  }
};