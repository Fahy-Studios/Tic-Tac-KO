import { useState, useCallback, useRef, useEffect } from 'react';
import { WinningLines, Upgrade, ParticleEvent, FloatingTextItem } from '../types';
import { checkWinningLines, clearWinningLines, checkForDraw, checkIfMoveBlocksOpponent } from '../utils/gameLogic';

export const useGameState = () => {
  const [board, setBoard] = useState<string[][]>(
    Array(3).fill(null).map(() => Array(3).fill(''))
  );
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
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
  const [activeText, setActiveText] = useState<FloatingTextItem | null>(null);
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
    if (!activeText && textQueue.length > 0) {
      const next = textQueue[0];
      setActiveText(next);
      setTextQueue(prev => prev.slice(1));
    }
  }, [activeText, textQueue]);

  const handleFloatingTextComplete = (id: number) => {
    if (activeText?.id === id) {
      if (activeText.onCompleteCallback) {
        activeText.onCompleteCallback();
      }
      setActiveText(null);
    }
  };

  const resetGame = () => {
    setBoard(Array(3).fill(null).map(() => Array(3).fill('')));
    setPlayerHP(100);
    setEnemyHP(100);
    setCurrentPlayer('X');
    setPlayerEXP(0);
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
    setActiveText(null);
    setIsShaking(false);
  };

  return {
    board, setBoard,
    playerHP, setPlayerHP,
    enemyHP, setEnemyHP,
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
    // Map activeText to array for compatibility with Game.tsx rendering map
    floatingTexts: activeText ? [activeText] : [],
    triggerFloatingText, 
    handleFloatingTextComplete,
    resetGame,
    isShaking, triggerShake
  };
};
