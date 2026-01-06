import React from 'react';
import logo from '../assets/logo.png';
import { useSound } from '../hooks/useSound';

interface StartScreenProps {
  onStart: () => void;
  onLocalMultiplayer: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onLocalMultiplayer }) => {
  const { playClick, isMuted, toggleMute } = useSound();

  const handleMuteToggle = () => {
    playClick();
    toggleMute();
  };

  return (
    <div className="start-screen">
      <div className="start-screen-controls" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
        <button 
          className="mute-button"
          onClick={handleMuteToggle}
          aria-label={isMuted ? "Unmute" : "Mute"}
          style={{
             background: '#f8f9fa',
             border: '3px solid #2d3142',
             borderRadius: '50%',
             width: '50px',
             height: '50px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             fontSize: '24px',
             cursor: 'pointer',
             boxShadow: '4px 4px 0px #2d3142',
             transition: 'all 0.2s',
             transform: 'rotate(-2deg)'
          }}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      <img src={logo} alt="Tic-Tac-KO" className="game-logo" />
      <div className="start-buttons">
        <button 
            className="start-button" 
            onClick={() => {
                playClick();
                onStart();
            }}
        >
            CAMPAIGN
        </button>
        <button 
            className="start-button secondary" 
            onClick={() => {
                playClick();
                onLocalMultiplayer();
            }}
        >
            LOCAL MULTIPLAYER
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
