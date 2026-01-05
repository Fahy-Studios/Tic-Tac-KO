import React from 'react';

interface EXPBarProps {
  exp: number;
  maxExp: number;
}

const EXPBar: React.FC<EXPBarProps> = ({ exp, maxExp }) => {
  const percentage = (exp / maxExp) * 100;

  return (
    <div className="exp-bar-container">
      <div className="exp-label">
        <span>EXP</span>
        <span>{exp}/{maxExp}</span>
      </div>
      <div className="exp-bar-background">
        <div 
          className="exp-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {percentage >= 100 && (
        <div className="level-up-indicator">LEVEL UP!</div>
      )}
    </div>
  );
};

export default EXPBar;