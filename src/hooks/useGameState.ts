import { useState, useCallback, useRef, useEffect } from 'react';
import { WinningLines, Upgrade, ParticleEvent, FloatingTextItem } from '../types';

export const useGameState = () => {
  const [board, setBoard] = useState<string[][]>(
    Array(3).fill(null).map(() => Array(3).fill(''))
  );
  
  // Level State
  const [currentLevelId, setCurrentLevelId] = useState(1);

  // HP & Stats
  const [maxPlayerHP, setMaxPlayerHP] = useState(100);
  const [maxEnemyHP, setMaxEnemyHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  
  // Battle State
  const [nextTurnDamageBonus, setNextTurnDamageBonus] = useState(0);
  const [nextTurnDamageReduction, setNextTurnDamageReduction] = useState(0); // 0 to 1 (percentage)

  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [playerEXP, setPlayerEXP] = useState(0);
  const [maxEXP] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [lastWinningLines, setLastWinningLines] = useState<WinningLines>([]);
  const [availableUpgrades, setAvailableUpgrades] = useState<Upgrade[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [consecutiveTurns, setConsecutiveTurns] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Your turn! Place an X");
  const [isEnemyThinking, setIsEnemyThinking] = useState(false);
  const [goldPiece, setGoldPiece] = useState<[number, number] | null>(null);
  
  const [particleEvents, setParticleEvents] = useState<ParticleEvent[]>([]);
  const nextParticleId = useRef(0);

  // Queue system for floating texts
  const [textQueue, setTextQueue] = useState<FloatingTextItem[]>([]);
  const [activeTexts, setActiveTexts] = useState<FloatingTextItem[]>([]);
  const nextFloatingTextId = useRef(0);

  // Screen shake state
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500); // 500ms matches CSS animation
  }, []);

  const triggerParticles = (startX: number, startY: number, color: string) => {
    setParticleEvents(prev => [...prev, {
      id: nextParticleId.current++,
      startX,
      startY,
      color
    }]);
  };

  const triggerFloatingText = useCallback((text: string, _x: number, _y: number, color?: string, onCompleteCallback?: () => void) => {
    // Always use window center as requested
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const newItem: FloatingTextItem = {
      id: nextFloatingTextId.current++,
      text,
      x: centerX,
      y: centerY,
      color,
      onCompleteCallback
    };
    
    setTextQueue(prev => [...prev, newItem]);
  }, []);

  // Process text queue
  useEffect(() => {
    if (textQueue.length > 0) {
      const delay = activeTexts.length === 0 ? 0 : 300; // Immediate if empty, else stagger
      
      const timer = setTimeout(() => {
        const next = textQueue[0];
        setActiveTexts(prev => [...prev, next]);
        setTextQueue(prev => prev.slice(1));
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [textQueue, activeTexts.length]);

  const handleFloatingTextComplete = (id: number) => {
    const text = activeTexts.find(t => t.id === id);
    if (text?.onCompleteCallback) {
        text.onCompleteCallback();
    }
    setActiveTexts(prev => prev.filter(t => t.id !== id));
  };

  const resetGame = () => {
    setBoard(Array(3).fill(null).map(() => Array(3).fill('')));
    setPlayerHP(maxPlayerHP);
    setEnemyHP(maxEnemyHP);
    setNextTurnDamageBonus(0);
    setNextTurnDamageReduction(0);
    setCurrentPlayer('X');
    setGameOver(false);
    setWinner(null);
    setLastWinningLines([]);
    setShowUpgradeModal(false);
    setConsecutiveTurns(0);
    setComboCount(0);
    setStatusMessage("Your turn! Place an X");
    setIsEnemyThinking(false);
    setParticleEvents([]);
    setGoldPiece(null);
    setTextQueue([]);
    setActiveTexts([]);
    setIsShaking(false);
  };

  return {
    board, setBoard,
    currentLevelId, setCurrentLevelId,
    playerHP, setPlayerHP,
    enemyHP, setEnemyHP,
    maxPlayerHP, setMaxPlayerHP,
    maxEnemyHP, setMaxEnemyHP,
    nextTurnDamageBonus, setNextTurnDamageBonus,
    nextTurnDamageReduction, setNextTurnDamageReduction,
    currentPlayer, setCurrentPlayer,
    playerEXP, setPlayerEXP,
    maxEXP,
    gameOver, setGameOver,
    winner, setWinner,
    lastWinningLines, setLastWinningLines,
    availableUpgrades, setAvailableUpgrades,
    showUpgradeModal, setShowUpgradeModal,
    consecutiveTurns, setConsecutiveTurns,
    comboCount, setComboCount,
    statusMessage, setStatusMessage,
    isEnemyThinking, setIsEnemyThinking,
    goldPiece, setGoldPiece,
    particleEvents, triggerParticles,
    floatingTexts: activeTexts,
    triggerFloatingText, 
    handleFloatingTextComplete,
    resetGame,
    isShaking, triggerShake
  };
};
