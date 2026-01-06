import React from 'react';

interface StartScreenProps {
  onStart: () => void;
  onLocalMultiplayer: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onLocalMultiplayer }) => {
  return (
    <div className="start-screen">
      <h1 className="game-title">Tic-Tac-KO</h1>
      <div className="start-buttons">
        <button className="start-button" onClick={onStart}>CAMPAIGN</button>
        <button className="start-button secondary" onClick={onLocalMultiplayer}>LOCAL MULTIPLAYER</button>
      </div>
    </div>
  );
};

export default StartScreen;
