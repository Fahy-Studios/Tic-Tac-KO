import React from 'react';
import { useSound } from '../hooks/useSound';
import { LEVELS } from '../data/levels';

interface LevelsPageProps {
  onLevelSelect: (level: number) => void;
  onBack: () => void;
}

const LevelsPage: React.FC<LevelsPageProps> = ({ onLevelSelect, onBack }) => {
  const { playClick } = useSound();

  return (
    <div className="levels-page">
      <div className="levels-header">
        <h2>Select Level</h2>
      </div>
      
      <div className="levels-grid">
        {LEVELS.map((level) => (
            <button 
                key={level.id}
                className={`level-card ${level.backgroundClass}-preview`} // Add preview class if we want specific styling per card
                onClick={() => {
                    playClick();
                    onLevelSelect(level.id);
                }}
            >
                <div className="level-number">{level.id}</div>
                <div className="level-name">{level.name}</div>
                <div className="level-desc" style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '5px' }}>
                    {level.aiDifficulty.toUpperCase()}
                </div>
            </button>
        ))}
      </div>

      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
        <button 
            className="back-button" 
            onClick={() => {
                playClick();
                onBack();
            }}
        >
            BACK
        </button>
      </div>
    </div>
  );
};

export default LevelsPage;
