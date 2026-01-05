import React from 'react';

interface SettingsModalProps {
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  soundEnabled,
  onSoundToggle,
  onClose
}) => {
  return (
    <div className="modal-overlay">
      <div className="settings-modal">
        <h2>Settings</h2>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => onSoundToggle(e.target.checked)}
            />
            Sound Effects
          </label>
        </div>
        <div className="setting-item">
          <span>Difficulty: Normal</span>
        </div>
        <button onClick={onClose} className="close-button">
          Close
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;