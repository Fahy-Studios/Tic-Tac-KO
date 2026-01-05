import React from 'react';

interface HPBarProps {
  label: string;
  hp: number;
  maxHP: number;
  isPlayer: boolean;
}

const HPBar: React.FC<HPBarProps> = ({ label, hp, maxHP, isPlayer }) => {
  const percentage = (hp / maxHP) * 100;
  const hearts = Math.ceil(hp / 20); // 5 hearts max

  return (
    <div className={`hp-bar-container ${isPlayer ? 'player' : 'enemy'}`}>
      <div className="hp-label">
        <span className="label-text">{label}</span>
        <span className="hp-text">{hp}/{maxHP}</span>
      </div>
      <div className="hp-bar-background">
        <div 
          className="hp-bar-fill"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: isPlayer ? '#4CAF50' : '#f44336'
          }}
        />
      </div>
      <div className="hearts">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`heart ${i < hearts ? 'filled' : 'empty'}`}>
            ♥
          </span>
        ))}
      </div>
    </div>
  );
};

export default HPBar;