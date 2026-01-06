import React from 'react';
import { useSound } from '../hooks/useSound';

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
        <button 
            className="level-card" 
            onClick={() => {
                playClick();
                onLevelSelect(1);
            }}
        >
            <div className="level-number">1</div>
            <div className="level-name">The Beginning</div>
        </button>
        <button className="level-card locked" disabled>
            <div className="level-number">2</div>
            <div className="level-name">Locked</div>
        </button>
         <button className="level-card locked" disabled>
            <div className="level-number">3</div>
            <div className="level-name">Locked</div>
        </button>
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
