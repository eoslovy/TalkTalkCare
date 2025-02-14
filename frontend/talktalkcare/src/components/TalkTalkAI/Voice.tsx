import React, { useState, useEffect, useRef } from 'react';
import "../../styles/components/Voice.css";
import axios from 'axios';
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import talktalk from "../../assets/talktalk.png";
import talkbubble from "../../assets/talkbubble.png";
import { Mic, MicOff } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type FontSize = 'small' | 'medium' | 'large';

interface RobotImageProps {
  isListening: boolean;
  isWaiting: boolean;
}

interface ControlsProps {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  showFontControls: boolean;
  setShowFontControls: (show: boolean) => void;
  toggleListening: () => void;
  clearTranscripts: () => void;
  isLoading: boolean;
  isListening: boolean;
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
        className={`robot-image ${isListening ? '' : 'listening'}`}
      />
    </div>
  );
};

const Controls: React.FC<ControlsProps> = ({
  fontSize,
  setFontSize,
  showFontControls,
  setShowFontControls,
  toggleListening,
  clearTranscripts,
  isLoading,
  isListening
}) => (
  <div className="controls-container">
    <div className="controls-row">
      <button
        onClick={() => setShowFontControls(!showFontControls)}
        className="control-button"
      >
        {showFontControls ? '숨기기' : '글자 크기'}
      </button>
      {showFontControls && (
        <div className="font-size-controls">
          <button
            onClick={() => setFontSize('small')}
            className={`font-size-button ${fontSize === 'small' ? 'active' : ''}`}
          >
            작게
          </button>
          <button
            onClick={() => setFontSize('medium')}
            className={`font-size-button ${fontSize === 'medium' ? 'active' : ''}`}
          >
            보통
          </button>
          <button
            onClick={() => setFontSize('large')}
            className={`font-size-button ${fontSize === 'large' ? 'active' : ''}`}
          >
            크게
          </button>
        </div>
      )}
    </div>
    <div className="controls-row">
      {/* 마이크 아이콘 버튼 */}
      <button
        onClick={toggleListening}
        className="control-button mic-button"
        disabled={isLoading}
      >
        {isListening ? <Mic size={24} color="white" /> : <MicOff size={24} color="white" />}
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
);

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
      const arrayBuffer = await response.AudioStream.transformToByteArray();
      const blob = new Blob([arrayBuffer], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);

      return new Promise<void>((resolve, reject) => {
        const audio = new Audio(url);

        audio.addEventListener('canplaythrough', () => {
          const playPromise = audio.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                audio.onended = () => {
                  URL.revokeObjectURL(url);
                  resolve();
                };
              })
              .catch((error) => {
                console.warn('자동 재생 차단:', error);
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
    return fallbackTextToSpeech(text);
  }
};

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

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('chatFontSize') as FontSize) || 'medium';
  });

  const [showFontControls, setShowFontControls] = useState(false);

  const fontSizeMap = {
    small: '16px',
    medium: '20px',
    large: '24px'
  };

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [savedTranscripts, setSavedTranscripts] = useState<Array<{ text: string, isUser: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const recognitionRef = useRef<any>(null);
  const tempTranscriptRef = useRef<string>('');
  const transcriptsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('chatFontSize', fontSize);
  }, [fontSize]);

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

      const response = await axios.get(`${BASE_URL}/talktalk/chat`, {
        params: { response: text, userId },
        timeout: 100000
      });

      if (response.data && response.data.body) {
        setSavedTranscripts(prev => [
          ...prev,
          { text: response.data.body, isUser: false }
        ]);
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

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      tempTranscriptRef.current = '';
      setTranscript('');
    }
  };

  // Modified toggleListening function
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const clearTranscripts = () => {
    setSavedTranscripts([]);
    tempTranscriptRef.current = '';
    setTranscript('');
  };

  return (
    <div className="chat-background">
      <div className="overall-chat-container">
        <div className="chat-header-container">
          <div className="chat-header-content">
            <h2>톡톡이와 즐거운 대화를 나눠보세요!</h2>
          </div>
        </div>
  
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
                    style={{ fontSize: fontSizeMap[fontSize] }}
                  >
                    {message.text}
                  </p>
                ))}
                <div ref={transcriptsEndRef} />
              </div>
            </div>
  
            <Controls
              fontSize={fontSize}
              setFontSize={setFontSize}
              showFontControls={showFontControls}
              setShowFontControls={setShowFontControls}
              toggleListening={toggleListening}
              clearTranscripts={clearTranscripts}
              isLoading={isLoading}
              isListening={isListening}
            />
          </div>
        </div>
      </div>
    </div>
  );
}  
export default SpeechToText;
