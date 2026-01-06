import React from 'react';

interface GameOverModalProps {
  winner: string | null;
  onRestart: () => void;
  isMultiplayer?: boolean;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ winner, onRestart, isMultiplayer = false }) => {
  const isPlayerWin = winner === 'Player';
  
  let title = '';
  let message = '';
  let className = '';

  if (isMultiplayer) {
    if (isPlayerWin) {
        title = 'Player 1 Wins!';
        message = 'Player 1 has conquered the board!';
        className = 'victory';
    } else {
        // In MP, if winner is not Player, it's Player 2 (Enemy)
        title = 'Player 2 Wins!';
        message = 'Player 2 has conquered the board!';
        className = 'victory'; // Both are winners in their own right, so use victory style or neutral? Victory is fine.
    }
  } else {
    if (isPlayerWin) {
        title = '🏆 Victory!';
        message = 'Congratulations! You have defeated your enemy in epic tic-tac-toe battle!';
        className = 'victory';
    } else {
        title = '💀 Defeat!';
        message = 'The enemy has bested you in combat. Train harder for your next battle!';
        className = 'defeat';
    }
  }

  return (
    <div className="modal-overlay">
      <div className="game-over-modal">
        <h2 className={className}>
          {title}
        </h2>
        <p className="result-text">
          {message}
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