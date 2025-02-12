import React, { useState, useEffect, useRef } from 'react';
import "../../styles/components/Voice.css";
import axios from 'axios';
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import talktalk from "../../assets/talktalk.png";
import talkbubble from "../../assets/talkbubble.png";

const BASE_URL =import.meta.env.VITE_API_BASE_URL

interface RobotImageProps {
  isListening: boolean;
  isWaiting: boolean;
}

// AWS Polly 클라이언트 설정
const pollyClient = new PollyClient({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY!
  }
});

const RobotImage: React.FC<RobotImageProps> = ({ isListening, isWaiting }) => {
  return (
    <div className="robot-image-container">
      <img 
        src={talktalk}
        alt="AI 로봇" 
        className={`robot-image ${isListening ? 'listening' : ''}`}
      />
      
      {isWaiting && (
        <div className="speech-bubble-container">
          <img 
            src={talkbubble} 
            alt="말풍선" 
            className="speech-bubble-image"
          />
          <div className="speech-bubble-text">전송 중입니다...</div>
        </div>
      )}
    </div>
  );
};

const synthesizeSpeech = async (text: string) => {
  try {
    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: "mp3",
      VoiceId: "Seoyeon",
      Engine: "neural",
      LanguageCode: "ko-KR"
    });

    const response = await pollyClient.send(command);

    if (response.AudioStream) {
      // ArrayBuffer로 변환
      const arrayBuffer = await response.AudioStream.transformToByteArray();
      
      // Blob 생성
      const blob = new Blob([arrayBuffer], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      
      // 오디오 재생 (사용자 상호작용 우회)
      return new Promise<void>((resolve, reject) => {
        const audio = new Audio(url);
        
        // 오디오 로드 완료 시 재생 시도
        audio.addEventListener('canplaythrough', () => {
          const playPromise = audio.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // 재생 성공
                audio.onended = () => {
                  URL.revokeObjectURL(url);
                  resolve();
                };
              })
              .catch((error) => {
                // 자동 재생 차단
                console.warn('자동 재생 차단:', error);
                // 폴백 메커니즘 (예: 브라우저 기본 TTS)
                fallbackTextToSpeech(text)
                  .then(resolve)
                  .catch(reject);
              });
          }
        });
      });
    }
  } catch (error) {
    console.error('Speech synthesis failed:', error);
    // 폴백 메커니즘
    return fallbackTextToSpeech(text);
  }
};


// 폴백 음성 합성 메서드
const fallbackTextToSpeech = async (text: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('음성 합성을 지원하지 않는 브라우저입니다.');
      reject(new Error('음성 합성 미지원'));
    }
  });
};

const SpeechToText = () => {
  const [userId, setUserId] = useState<number>(() => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId) : 7;
  });

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [savedTranscripts, setSavedTranscripts] = useState<Array<{text: string, isUser: boolean}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const tempTranscriptRef = useRef<string>('');
  const transcriptsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [savedTranscripts]);

  useEffect(() => {
    localStorage.setItem('userId', userId.toString());
  }, [userId]);

  const startChat = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/talktalk/start`, null, {
        params: { userId }
      });
      
      if (response.data) {
        console.log('대화 시작');
      }
    } catch (error) {
      console.error('대화 시작 에러:', error);
    }
  };

  const sendTranscriptToServer = async (text: string) => {
    try {
      setIsLoading(true);
      setIsWaiting(true);
      stopListening();
  
      setSavedTranscripts(prev => [
        ...prev,
        { text, isUser: true }
      ]);
  
      console.log('전송할 데이터:', { response: text, userId });
  
      const response = await axios.get(`${BASE_URL}/talktalk/chat`, {
        params: { response: text, userId },
        timeout: 100000
      });
  
      if (response.data && response.data.body) {
        console.log('AI 응답:', response.data.body);
        setSavedTranscripts(prev => [
          ...prev,
          { text: response.data.body, isUser: false }
        ]);
        // AI 응답을 음성으로 변환
        await synthesizeSpeech(response.data.body);
      }
  
    } catch (error) {
      console.error('전송 중 에러:', error);
    } finally {
      setIsLoading(false);
      setIsWaiting(false);
      startListening();
    }
  };

  const endChat = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/talktalk/end`, null, {
        params: { userId }
      });
      
      if (response.data) {
        console.log('대화 종료 및 저장 완료');
      }
    } catch (error) {
      console.error('대화 종료 에러:', error);
    }
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ko-KR';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        
        if (event.results[current].isFinal) {
          sendTranscriptToServer(transcriptText);
        } else {
          tempTranscriptRef.current = transcriptText;
          setTranscript(transcriptText);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('음성 인식 에러:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        tempTranscriptRef.current = '';
        setTranscript('');
      };

      startListening();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = async () => {
    if (!recognitionRef.current || isLoading || isListening) return;
  
    try {
      await startChat();
      recognitionRef.current.start();
      setIsListening(true);
      tempTranscriptRef.current = '';
      setTranscript('');
    } catch (error) {
      console.error('시작 에러:', error);
    }
  };

  const stopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      tempTranscriptRef.current = '';
      setTranscript('');
    }
  };

  const clearTranscripts = () => {
    setSavedTranscripts([]);
    tempTranscriptRef.current = '';
    setTranscript('');
  };

  return (
    <div className="chat-container">
      <div className="speech-to-text-section">
        <div className="speech-recognition-container">
          <RobotImage isListening={isListening} isWaiting={isWaiting} />
        </div>
      </div>

      <div className="chat-content-section">
        <div className="saved-transcripts">
          <div className="transcripts-list">
            {savedTranscripts.map((message, index) => (
              <p 
                key={index} 
                className={`transcript-item ${message.isUser ? 'user-message' : 'ai-message'}`}
              >
                {message.text}
              </p>
            ))}
            <div ref={transcriptsEndRef} />
          </div>
        </div>
        
        <div className="controls">
          <button 
            onClick={stopListening} 
            className="control-button"
            disabled={isLoading}
          >
            마이크 끄기
          </button>
          <button 
            onClick={clearTranscripts} 
            className="clear-button"
            disabled={isLoading}
          >
            기록 지우기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;

