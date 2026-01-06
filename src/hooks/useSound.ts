import { useCallback, useState } from 'react';
import { soundManager } from '../utils/soundManager';

export const useSound = () => {
  const [isMuted, setIsMuted] = useState(soundManager.getMute());

  const toggleMute = useCallback(() => {
    const newState = !soundManager.getMute();
    soundManager.setMute(newState);
    setIsMuted(newState);
  }, []);

  return {
    isMuted,
    toggleMute,
    playPop: () => soundManager.playPop(),
    playAttack: () => soundManager.playAttack(),
    playCrit: () => soundManager.playCrit(),
    playBlock: () => soundManager.playBlock(),
    playPowerUp: () => soundManager.playPowerUp(),
    playVictory: () => soundManager.playVictory(),
    playDefeat: () => soundManager.playDefeat(),
    playClick: () => soundManager.playClick(),
  };
};
