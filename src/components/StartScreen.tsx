import React from 'react';
import logo from '../assets/logo.png';

interface StartScreenProps {
  onStart: () => void;
  onLocalMultiplayer: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onLocalMultiplayer }) => {
  return (
    <div className="start-screen">
      <img src={logo} alt="Tic-Tac-KO" className="game-logo" />
      <div className="start-buttons">
        <button className="start-button" onClick={onStart}>CAMPAIGN</button>
        <button className="start-button secondary" onClick={onLocalMultiplayer}>LOCAL MULTIPLAYER</button>
      </div>
    </div>
  );
};

export default StartScreen;
