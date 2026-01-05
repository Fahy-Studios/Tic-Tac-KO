import React from 'react';

interface GameOverModalProps {
  winner: string | null;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ winner, onRestart }) => {
  const isPlayerWin = winner === 'Player';

  return (
    <div className="modal-overlay">
      <div className="game-over-modal">
        <h2 className={isPlayerWin ? 'victory' : 'defeat'}>
          {isPlayerWin ? '🏆 Victory!' : '💀 Defeat!'}
        </h2>
        <p className="result-text">
          {isPlayerWin 
            ? 'Congratulations! You have defeated your enemy in epic tic-tac-toe battle!'
            : 'The enemy has bested you in combat. Train harder for your next battle!'
          }
        </p>
        <div className="game-over-actions">
          <button onClick={onRestart} className="restart-button large">
            New Battle
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;