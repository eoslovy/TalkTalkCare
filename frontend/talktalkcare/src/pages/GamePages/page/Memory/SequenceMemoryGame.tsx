import React, { useState, useEffect } from 'react';
import './SequenceMemoryGame.css';
import GamePage from '../GamePage';

//순서 기억하기 게임
interface ColorButton {
  id: number;
  color: string;
  sound: string;
}

interface SoundFrequencies {
  [key: string]: number;
}

const SequenceMemoryGame: React.FC = () => {
  const [sequence, setSequence] = useState<ColorButton[]>([]);
  const [userSequence, setUserSequence] = useState<ColorButton[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showingSequence, setShowingSequence] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const colors: ColorButton[] = [
    { id: 1, color: '#FF5252', sound: 'C4' },
    { id: 2, color: '#4CAF50', sound: 'D4' },
    { id: 3, color: '#2196F3', sound: 'E4' },
    { id: 4, color: '#FFC107', sound: 'F4' }
  ];

  const playSound = (note: string): void => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const noteFrequencies: SoundFrequencies = {
      'C4': 261.63,
      'D4': 293.66,
      'E4': 329.63,
      'F4': 349.23
    };
    
    oscillator.frequency.value = noteFrequencies[note];
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const createSequence = (): ColorButton[] => {
    const length = Math.min(2 + level, 9);
    const newSequence = Array(length).fill(0).map(() => 
      colors[Math.floor(Math.random() * colors.length)]
    );
    setSequence(newSequence);
    return newSequence;
  };

  const showSequence = async (seq: ColorButton[]): Promise<void> => {
    setShowingSequence(true);
    setUserSequence([]);
    
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      playSound(seq[i].sound);
      const button = document.querySelector(`[data-id="${seq[i].id}"]`);
      if (button) {
        button.classList.add('active');
        await new Promise(resolve => setTimeout(resolve, 500));
        button.classList.remove('active');
      }
    }
    
    setShowingSequence(false);
    setIsPlaying(true);
  };

  const handleButtonClick = (color: ColorButton): void => {
    if (!isPlaying || showingSequence) return;

    const button = document.querySelector(`[data-id="${color.id}"]`);
    if (button) {
      button.classList.add('active');
      setTimeout(() => {
        button.classList.remove('active');
      }, 300);
    }

    playSound(color.sound);
    const newUserSequence = [...userSequence, color];
    setUserSequence(newUserSequence);

    const currentIndex = newUserSequence.length - 1;
    if (color.id !== sequence[currentIndex].id) {
      setMessage('틀렸습니다. 다시 시도하세요.');
      setIsPlaying(false);
      setTimeout(() => {
        setMessage('');
        showSequence(sequence);
      }, 1500);
      return;
    }

    if (newUserSequence.length === sequence.length) {
      setScore(score + (level * 10));
      setLevel(level + 1);
      setMessage('정답입니다!');
      setIsPlaying(false);
      setTimeout(() => {
        setMessage('');
        const newSeq = createSequence();
        showSequence(newSeq);
      }, 1500);
    }
  };

  useEffect(() => {
    if (gameStarted && !isPlaying && !showingSequence) {
      const newSeq = createSequence();
      showSequence(newSeq);
    }
  }, [gameStarted]);

  return (
    <GamePage 
      title="순서 기억하기"
      onRestart={() => {
        setGameStarted(false);
        setScore(0);
        setLevel(1);
      }}
      gameStarted={gameStarted}
    >
      {!gameStarted ? (
        <div className="instructions">
          <h3>게임 방법</h3>
          <p>1. 점등되는 색상의 순서를 잘 기억하세요.</p>
          <p>2. 같은 순서대로 색상을 클릭하세요.</p>
          <p>3. 레벨이 올라갈수록 기억해야 할 순서가 길어집니다.</p>
          <p>4. 소리를 켜면 더 쉽게 기억할 수 있습니다.</p>
          <button onClick={() => setGameStarted(true)}>게임 시작</button>
        </div>
      ) : (
        <div className="game-content">
          <div className="game-info">
            <div className="score">점수: {score}</div>
            <div className="level">레벨: {level}</div>
          </div>

          <div className="color-grid">
            {colors.map(color => (
              <button
                key={color.id}
                data-id={color.id}
                className="color-button"
                style={{ backgroundColor: color.color }}
                onClick={() => handleButtonClick(color)}
                disabled={showingSequence || !isPlaying}
              />
            ))}
          </div>

          {message && (
            <div className={`message ${message.includes('정답') ? 'correct' : 'wrong'}`}>
              {message}
            </div>
          )}
        </div>
      )}
    </GamePage>
  );
};

export default SequenceMemoryGame; 