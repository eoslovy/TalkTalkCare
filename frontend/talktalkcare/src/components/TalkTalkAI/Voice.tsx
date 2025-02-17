declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
    webkitAudioContext: typeof AudioContext;
  }
}

import React, { useState, useEffect, useRef } from 'react';
import "../../styles/components/Voice.css";
import axios from 'axios';
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import talktalk from "../../assets/talktalk.png";
import { Mic, MicOff } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type FontSize = 'small' | 'medium' | 'large';

interface RobotImageProps {
  isListening: boolean;
  isSpeaking: boolean;
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

let audioContext: AudioContext | null = null;
let audio: HTMLAudioElement | null = null;
let recognition: any = null;

const RobotImage: React.FC<RobotImageProps> = ({ isListening, isSpeaking }) => {
  const imageClass = `robot-image ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`;
  return (
    <div className="robot-image-container">
      <img
        src={talktalk}
        alt="AI 로봇"
        className={imageClass}
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

const SpeechToText = () => {
  const [userId] = useState<number>(() => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId) : 7;
  });

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('chatFontSize') as FontSize) || 'medium';
  });

  const [showFontControls, setShowFontControls] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [savedTranscripts, setSavedTranscripts] = useState<Array<{ text: string, isUser: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isComponentMounted = useRef(true);

  const transcriptsEndRef = useRef<HTMLDivElement>(null);
  const transcriptsListRef = useRef<HTMLDivElement>(null);

  const fontSizeMap = {
    small: '16px',
    medium: '20px',
    large: '24px'
  };
  const cleanup = () => {
    // 음성 재생 중지
    if (audio) {
      audio.pause();
      audio.src = '';
      audio = null;
    }
  
    // 음성 인식 중지
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
  
    // 음성 합성 중지
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  
    // 상태 초기화
    setIsListening(false);
    setIsSpeaking(false);
    setTranscript('');
  };
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
      cleanup();  // cleanup 함수 호출
    };
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ko-KR';
  
      recognition.onresult = (event: any) => {
        if (!isComponentMounted.current) return;  // 마운트 상태 확인
        
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
  
        if (event.results[current].isFinal) {
          sendTranscriptToServer(transcriptText);
        } else {
          setTranscript(transcriptText);
        }
      };
  
      recognition.onerror = () => {
        if (isComponentMounted.current) {
          setIsListening(false);
        }
      };
  
      recognition.onend = () => {
        if (isComponentMounted.current) {
          setIsListening(false);
          setTranscript('');
        }
      };
  
      startListening();
    }
  
    // cleanup 함수 개선
    return () => {
      cleanup();  // cleanup 함수 호출
    };
  }, []);
  
  const synthesizeSpeech = async (text: string): Promise<void> => {
    try {
      setIsSpeaking(true);
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
          if (audio) {
            audio.pause();
            audio = null;
          }

          audio = new Audio(url);

          if (!audio) {
            setIsSpeaking(false);
            reject(new Error('Failed to create audio element'));
            return;
          }

          audio.addEventListener('play', () => {
            setIsSpeaking(true);
          });

          audio.addEventListener('ended', () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(url);
            resolve();
          });

          audio.addEventListener('pause', () => {
            setIsSpeaking(false);
          });

          audio.addEventListener('error', (error) => {
            console.error('Audio playback error:', error);
            setIsSpeaking(false);
            reject(error);
          });

          const playPromise = audio.play();

          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.warn('자동 재생 차단:', error);
              setIsSpeaking(false);
              fallbackTextToSpeech(text)
                .then(resolve)
                .catch(reject);
            });
          }
        });
      }
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      setIsSpeaking(false);
      return fallbackTextToSpeech(text);
    }
  };

  const fallbackTextToSpeech = async (text: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      if (!isComponentMounted.current) {
        resolve();
        return;
      }

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };
        utterance.onerror = (error) => reject(error);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      } else {
        console.warn('음성 합성을 지원하지 않는 브라우저입니다.');
        setIsSpeaking(false);
        reject(new Error('음성 합성 미지원'));
      }
    });
  };

  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
      if (audio) {
        audio.pause();
        audio.src = '';
        audio = null;
      }
      if (recognition) {
        recognition.stop();
      }
      setIsSpeaking(false);
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('chatFontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    const savedTranscripts = localStorage.getItem('savedTranscripts');
    if (savedTranscripts) {
      setSavedTranscripts(JSON.parse(savedTranscripts));
    }
    startChat();
  }, []);

  useEffect(() => {
    localStorage.setItem('savedTranscripts', JSON.stringify(savedTranscripts));
    if (transcriptsListRef.current) {
      transcriptsListRef.current.scrollTop = transcriptsListRef.current.scrollHeight;
    }
  }, [savedTranscripts]);

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
      startListening();
    }
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ko-KR';

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;

        if (event.results[current].isFinal) {
          sendTranscriptToServer(transcriptText);
        } else {
          setTranscript(transcriptText);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTranscript('');
      };

      startListening();
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  const startListening = async () => {
    if (!recognition || isLoading || isListening) return;

    try {
      await startChat();
      recognition.start();
      setIsListening(true);
      setTranscript('');
    } catch (error) {
      console.error('시작 에러:', error);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      setTranscript('');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const clearTranscripts = () => {
    setSavedTranscripts([]);
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
              <RobotImage isListening={isListening} isSpeaking={isSpeaking} />
            </div>
          </div>
  
          <div className="chat-content-section">
            <div className="saved-transcripts">
              <div ref={transcriptsListRef} className="transcripts-list">
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
};

export default SpeechToText;