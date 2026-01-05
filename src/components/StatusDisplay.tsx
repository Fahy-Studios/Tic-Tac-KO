import React from 'react';

interface StatusDisplayProps {
  message: string;
  currentPlayer: 'X' | 'O';
  comboCount: number;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ 
  message, 
  currentPlayer, 
  comboCount 
}) => {
  return (
    <div className="status-display">
      <div className="status-bubble">
        <div className="status-message">
          {message}
        </div>
        {comboCount > 1 && (
          <div className="combo-indicator">
            {comboCount}x COMBO!
          </div>
        )}
      </div>
      <div className="turn-indicator">
        <span className={`turn-mark ${currentPlayer === 'X' ? 'active' : ''}`}>X</span>
        <span className="vs">VS</span>
        <span className={`turn-mark ${currentPlayer === 'O' ? 'active' : ''}`}>O</span>
      </div>
    </div>
  );
};

export default StatusDisplay;