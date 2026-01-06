import { useState, useCallback, useRef } from 'react';
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

  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);
  const nextFloatingTextId = useRef(0);

  const triggerParticles = (startX: number, startY: number, color: string) => {
    setParticleEvents(prev => [...prev, {
      id: nextParticleId.current++,
      startX,
      startY,
      color
    }]);
  };

  const triggerFloatingText = useCallback((text: string, _x: number, _y: number, color?: string) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    setFloatingTexts(prev => [...prev, {
      id: nextFloatingTextId.current++,
      text,
      x: centerX,
      y: centerY,
      color
    }]);
  }, []);

  const handleFloatingTextComplete = (id: number) => {
    setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
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
    setFloatingTexts([]);
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
    floatingTexts, triggerFloatingText, handleFloatingTextComplete,
    resetGame
  };
};
