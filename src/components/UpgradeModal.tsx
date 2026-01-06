import React from 'react';
import { Upgrade } from '../types';

interface UpgradeModalProps {
  upgrades: Upgrade[];
  onSelect: (upgrade: Upgrade) => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ upgrades, onSelect }) => {
  return (
    <div className="modal-overlay upgrade-overlay">
      <div className="upgrade-modal">
        <h2>Pick your upgrade</h2>
        <div className="upgrade-options">
          {upgrades.map((upgrade) => (
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
