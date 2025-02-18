import React, { useState, useEffect, useRef } from 'react';
import "../../styles/components/Voice.css";
import axios from 'axios';
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import talktalk from "../../assets/talktalk.png";
import { Mic, MicOff } from "lucide-react";
// import CustomModal from '../CustomModal';  // 상위 폴더에서 CustomModal import
import { useNavigate } from 'react-router-dom';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// TypeScript에서 window 객체에 대한 타입을 확장합니다.
declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

type FontSize = 'small' | 'medium' | 'large';

interface RobotImageProps {
  isListening: boolean;
  isSpeaking: boolean;
}

interface CustomModalProps {
  title: string;
  message: string;
  isOpen: boolean;
  onClose?: () => void;  // 단순 닫기용으로 optional로 변경
  onConfirm?: () => Promise<void>;  // '예' 버튼용, Promise<void>로 수정
  onCancel?: () => void;   // '아니오' 버튼용
  showConfirmButtons?: boolean;  // 예/아니오 버튼 표시 여부
}

interface ControlsProps {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  toggleListening: () => void;
  clearTranscripts: () => void;
  isLoading: boolean;
  isListening: boolean;
  onEndChat: () => void;
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
  toggleListening,
  clearTranscripts,
  isLoading,
  isListening,
  onEndChat
}) => (
  <div className="controls-container">
    <div className="controls-row">
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
      <button
        onClick={onEndChat}
        className="control-button end-chat-button"
        disabled={isLoading}
      >
        대화 종료
      </button>
    </div>
  </div>
);
const SpeechToText = () => {
  const navigate = useNavigate();
  const [userId] = useState<number>(() => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId) : 7;
  });
  
  const [showEndModal, setShowEndModal] = useState(false);  // 모달 상태 추가
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('chatFontSize') as FontSize) || 'small'; // 기본값을 'small'로 변경
  });
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [savedTranscripts, setSavedTranscripts] = useState<Array<{ text: string, isUser: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isComponentMounted = useRef(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  const transcriptsEndRef = useRef<HTMLDivElement>(null);
  const transcriptsListRef = useRef<HTMLDivElement>(null);

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: '#c8e6c9',
    // display : 'flex'
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    maxWidth: '400px',
    width: '90%',
    height:'200px'
  };

  const modalButtonStyle: React.CSSProperties = {
    margin: '10px',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer'
  };
  // endChat 함수 정의
  const handleEndChat = async () => {
    try {
      await axios.post(`${BASE_URL}/talktalk/end`, null, {
        params: { userId }
      });
      setShowEndModal(false);  // 모달 닫기
      navigate('/');  // 메인 페이지로 이동
    } catch (error) {
      console.error('대화 종료 중 오류:', error);
      alert('대화 종료 중 오류가 발생했습니다.');
    }
  };

  const handleEndChatClick = () => {
    setShowEndModal(true);
  };

  const handleModalCancel = () => {
    setShowEndModal(false);
  };

  const handleModalClose = async () => {
    await handleEndChat();
    setShowEndModal(false);
  };

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
    // 페이지 첫 진입 시 무조건 모달 표시
    setShowWelcomeModal(true);
  }, []); 

  useEffect(() => {
    const savedTranscripts = localStorage.getItem('savedTranscripts');
    if (savedTranscripts) {
      setSavedTranscripts(JSON.parse(savedTranscripts));
    }
    
    // startChat 호출 시 모달 상태를 건드리지 않도록 수정
    startChat();
  }, []);

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

    // 현재 대화를 추가
    setSavedTranscripts(prev => [
      ...prev,
      { text, isUser: true }
    ]);

    // 이전 대화 내용을 포함하여 전송
    const response = await axios.get(`${BASE_URL}/talktalk/chat`, {
      params: { 
        response: text, 
        userId,
        // 이전 대화 내용을 포함
        context: savedTranscripts.map(msg => ({
          text: msg.text,
          isUser: msg.isUser
        }))
      },
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
              toggleListening={toggleListening}
              clearTranscripts={clearTranscripts}
              isLoading={isLoading}
              isListening={isListening}
              onEndChat={handleEndChatClick}
            />
          </div>
        </div>
      </div>
      {showEndModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>대화 종료</h3>
            <p
            style={{ marginTop: '20px' }}>정말로 대화를 종료하시겠습니까?</p>
            <div>
              <button 
                onClick={handleEndChat}
                style={{
                  ...modalButtonStyle,
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  marginTop:'40px',
                  width:'90px'
                }}
              >
                예
              </button>
              <button 
                onClick={() => setShowEndModal(false)}
                style={{
                  ...modalButtonStyle,
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  width:'90px'

                }}
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeechToText;
