import React from 'react';

interface Upgrade {
  id: string;
  name: string;
  description: string;
  effect: () => void;
}

interface UpgradeModalProps {
  upgrades: Upgrade[];
  onSelect: (upgrade: Upgrade) => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ upgrades, onSelect }) => {
  return (
    <div className="modal-overlay">
      <div className="upgrade-modal">
        <h2>Level Up!</h2>
        <p>Choose your upgrade:</p>
        <div className="upgrade-options">
          {upgrades.map((upgrade, index) => (
            <button
              key={upgrade.id}
              className="upgrade-option"
              onClick={() => onSelect(upgrade)}
            >
              <div className="upgrade-name">{upgrade.name}</div>
              <div className="upgrade-description">{upgrade.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;