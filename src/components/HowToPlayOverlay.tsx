import React from 'react';

interface HowToPlayOverlayProps {
  onClose: () => void;
}

const HowToPlayOverlay: React.FC<HowToPlayOverlayProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="how-to-play-modal">
        <h2>How to Play Tic-Tac-Battle</h2>
        <div className="tutorial-content">
          <div className="tutorial-section">
            <h3>🎯 Objective</h3>
            <p>Defeat your enemy by reducing their HP to 0 through strategic tic-tac-toe battles!</p>
          </div>
          
          <div className="tutorial-section">
            <h3>⚔️ Combat System</h3>
            <ul>
              <li>Complete a line (3 in a row) to deal 15 damage to your opponent</li>
              <li>Multiple lines with one move create combos (1.5x damage multiplier)</li>
              <li><strong>Completing any line grants you a bonus turn as a reward!</strong></li>
              <li>Completed lines disappear, but other pieces remain on the board</li>
              <li>If the board fills with no winning lines, both players take 10 damage and the board resets</li>
            </ul>
          </div>

          <div className="tutorial-section">
            <h3>🎲 Bonus Turn System</h3>
            <ul>
              <li>Every time you complete a line, you get an immediate bonus turn</li>
              <li>This applies to both you and the enemy - line completion is always rewarded</li>
              <li>Some upgrades can grant additional bonus turns on top of line completion rewards</li>
            </ul>
          </div>

          <div className="tutorial-section">
            <h3>📈 Experience & Upgrades</h3>
            <ul>
              <li>Gain 49 EXP for each line completed (balanced for strategic progression)</li>
              <li>Gain 33 EXP for blocking enemy lines (balanced for strategic progression)</li>
              <li>Level up at 100 EXP to choose powerful upgrades</li>
              <li>Upgrades include healing, extra turns, and special abilities</li>
            </ul>
          </div>

          <div className="tutorial-section">
            <h3>🤖 Enemy AI</h3>
            <p>The enemy will try to win first, block your moves second, and make random moves as a last resort. The enemy also gets bonus turns when completing lines!</p>
          </div>
        </div>
        
        <button onClick={onClose} className="close-button">
          Start Battle!
        </button>
      </div>
    </div>
  );
};

export default HowToPlayOverlay;