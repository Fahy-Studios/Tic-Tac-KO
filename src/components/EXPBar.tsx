import React, { useState, useEffect } from 'react';

interface EXPBarProps {
  exp: number;
  maxExp: number;
}

const EXPBar: React.FC<EXPBarProps> = ({ exp, maxExp }) => {
  const [visualExp, setVisualExp] = useState(exp);

  useEffect(() => {
    // If exp is reset to 0 (new game), update immediately
    if (exp === 0) {
      setVisualExp(0);
      return;
    }

    // Determine delay:
    // 500ms (Gold Effect) + 1200ms (Particle Flight) = 1700ms
    const delay = 1700;

    const timer = setTimeout(() => {
      setVisualExp(exp);
    }, delay);

    return () => clearTimeout(timer);
  }, [exp]);

  const percentage = (visualExp / maxExp) * 100;

  return (
    <div className="exp-bar-container">
      <div className="exp-label">
        <span>EXP</span>
        <span>{visualExp}/{maxExp}</span>
      </div>
      <div className="exp-bar-background">
        <div 
          className="exp-bar-fill"
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      {/* Show level up if we are visually full OR if the actual logic has already levelled up (optional, but visual is better) */}
      {percentage >= 100 && (
        <div className="level-up-indicator">LEVEL UP!</div>
      )}
    </div>
  );
};

export default EXPBar;