import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="start-screen">
      <h1 className="game-title">Tic-Tac-KO</h1>
      <button className="start-button" onClick={onStart}>START GAME</button>
    </div>
  );
};

export default StartScreen;
