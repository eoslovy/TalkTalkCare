import React, { useState, useEffect, useRef } from 'react';
import "../../styles/components/Voice.css";
import axios from 'axios';
import SpeechToText from '../../components/TalkTalkAI/Voice';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TalkTalk = () => {
  const [userId] = useState<number>(() => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId) : 7;
  });

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [savedTranscripts, setSavedTranscripts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const recognitionRef = useRef<any>(null);

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
          setSavedTranscripts(prev => [...prev, transcriptText]);
          setTranscript('');
        } else {
          setTranscript(transcriptText);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('음성 인식 에러:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setTranscript('');
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('시작 에러:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="wrapper">
      <SpeechToText />
      <div className="speech-to-text-container">
        <div className="image-section">

          <div className="control-section">
            {/* 컨트롤 영역 내용 */}
          </div>
        </div>

        <div className="transcripts-section">
          {savedTranscripts.map((text, index) => (
            <div key={index} className="transcript-item">
              {text}
            </div>
          ))}
          {transcript && (
            <div className="transcript-item" style={{ fontStyle: 'italic' }}>
              {transcript}...
            </div>
          )}
        </div>
      </div>
      
      <div className="bottom-section">
        {/* 하단 영역 내용 */}
      </div>
    </div>
  );
};

export default TalkTalk;