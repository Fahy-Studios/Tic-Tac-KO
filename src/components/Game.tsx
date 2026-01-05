import React, { useState, useEffect, useCallback } from 'react';
import TicTacToeBoard from './TicTacToeBoard';
import HPBar from './HPBar';
import EXPBar from './EXPBar';
import StatusDisplay from './StatusDisplay';
import UpgradeModal from './UpgradeModal';
import SettingsModal from './SettingsModal';
import HowToPlayOverlay from './HowToPlayOverlay';
import GameOverModal from './GameOverModal';

interface Upgrade {
  id: string;
  name: string;
  description: string;
  effect: () => void;
}

type WinningLine = [number, number][];
type WinningLines = WinningLine[];

const Game: React.FC = () => {
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
  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isEnemyThinking, setIsEnemyThinking] = useState(false);

  // Game balance parameters - EXP gains reduced by 35% for balanced progression
  const baseDamage = 15;
  const comboDamageMultiplier = 1.5;
  const drawDamage = 10;
  const lineCompletionEXP = 49; // Reduced from 75 by 35% (75 * 0.65 = 48.75 → 49)
  const blockEXP = 33; // Reduced from 50 by 35% (50 * 0.65 = 32.5 → 33)
  const lineCompletionBonusTurns = 1;

  const checkWinningLines = useCallback((board: string[][], player: string): WinningLines => {
    const lines: WinningLine[] = [
      [[0, 0], [0, 1], [0, 2]], // rows
      [[1, 0], [1, 1], [1, 2]],
      [[2, 0], [2, 1], [2, 2]],
      [[0, 0], [1, 0], [2, 0]], // columns
      [[0, 1], [1, 1], [2, 1]],
      [[0, 2], [1, 2], [2, 2]],
      [[0, 0], [1, 1], [2, 2]], // diagonals
      [[0, 2], [1, 1], [2, 0]]
    ];

    const winningLines: WinningLines = [];
    for (const line of lines) {
      if (line.every(([row, col]) => board[row][col] === player)) {
        winningLines.push(line);
      }
    }
    return winningLines;
  }, []);

  const clearWinningLines = useCallback((board: string[][], lines: WinningLines) => {
    const newBoard = board.map(row => [...row]);
    for (const line of lines) {
      for (const [row, col] of line) {
        newBoard[row][col] = '';
      }
    }
    return newBoard;
  }, []);

  const checkForDraw = useCallback((board: string[][]) => {
    // Check if board is full
    const isBoardFull = board.every(row => row.every(cell => cell !== ''));
    
    if (!isBoardFull) return false;
    
    // Check if there are any winning lines for either player
    const playerXWins = checkWinningLines(board, 'X').length > 0;
    const playerOWins = checkWinningLines(board, 'O').length > 0;
    
    // It's a draw if board is full and no one has winning lines
    return !playerXWins && !playerOWins;
  }, [checkWinningLines]);

  const checkIfMoveBlocksOpponent = useCallback((board: string[][], row: number, col: number, currentPlayer: string): boolean => {
    const opponent = currentPlayer === 'X' ? 'O' : 'X';
    
    // Create a test board with the opponent's piece at this position
    const testBoard = board.map(r => [...r]);
    testBoard[row][col] = opponent;
    
    // Check if this would create a winning line for the opponent
    const opponentWins = checkWinningLines(testBoard, opponent);
    
    return opponentWins.length > 0;
  }, [checkWinningLines]);

  const handleDraw = useCallback(() => {
    // Deal damage to both players
    setPlayerHP(prev => Math.max(0, prev - drawDamage));
    setEnemyHP(prev => Math.max(0, prev - drawDamage));
    
    // Reset board completely
    setBoard(Array(3).fill(null).map(() => Array(3).fill('')));
    
    // Reset turn to player
    setCurrentPlayer('X');
    setConsecutiveTurns(0);
    
    // Show draw message
    setStatusMessage(`Draw! Both players take ${drawDamage} damage. Board reset.`);
    
    // Clear any winning lines display
    setLastWinningLines([]);
    setComboCount(0);
  }, [drawDamage]);

  const generateUpgrades = useCallback((): Upgrade[] => {
    const allUpgrades: Upgrade[] = [
      {
        id: 'heal',
        name: 'Battle Heal',
        description: 'Restore 25 HP',
        effect: () => setPlayerHP(prev => Math.min(100, prev + 25))
      },
      {
        id: 'double_turn',
        name: 'Swift Strike',
        description: 'Take an extra turn',
        effect: () => setConsecutiveTurns(prev => prev + 1)
      },
      {
        id: 'clear_enemy',
        name: 'Disruption',
        description: 'Remove a random enemy piece',
        effect: () => {
          setBoard(prev => {
            const enemyPositions: [number, number][] = [];
            for (let i = 0; i < 3; i++) {
              for (let j = 0; j < 3; j++) {
                if (prev[i][j] === 'O') {
                  enemyPositions.push([i, j]);
                }
              }
            }
            if (enemyPositions.length > 0) {
              const randomPos = enemyPositions[Math.floor(Math.random() * enemyPositions.length)];
              const newBoard = prev.map(row => [...row]);
              newBoard[randomPos[0]][randomPos[1]] = '';
              return newBoard;
            }
            return prev;
          });
        }
      },
      {
        id: 'damage_boost',
        name: 'Power Strike',
        description: 'Next line deals +10 damage',
        effect: () => {
          // This would need to be implemented with a temporary boost state
          setStatusMessage('Next line will deal bonus damage!');
        }
      }
    ];

    // Return 3 random upgrades
    const shuffled = allUpgrades.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  const handleCellClick = (row: number, col: number, isAIMove: boolean = false) => {
    if (board[row][col] !== '' || gameOver) return;
    
    // Allow player moves when it's player turn and not showing upgrade modal
    // For Swift Strike, we need to allow moves even if upgrade modal was just closed
    if (!isAIMove && currentPlayer === 'O') return;
    
    // Only allow AI moves if it's an AI move and it's the enemy's turn  
    if (isAIMove && currentPlayer === 'X') return;

    // Check if this move blocks the opponent (before making the move)
    const isBlockingMove = currentPlayer === 'X' && checkIfMoveBlocksOpponent(board, row, col, currentPlayer);

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    const winningLines = checkWinningLines(newBoard, currentPlayer);
    const combo = winningLines.length;
    setComboCount(combo);

    let expGained = 0;
    let statusMessages: string[] = [];

    if (combo > 0) {
      // Calculate damage
      let damage = baseDamage * combo;
      if (combo > 1) {
        damage = Math.floor(damage * comboDamageMultiplier);
      }

      // Apply damage and EXP
      if (currentPlayer === 'X') {
        setEnemyHP(prev => Math.max(0, prev - damage));
        expGained += lineCompletionEXP * combo;
        setPlayerEXP(prev => prev + expGained);
        statusMessages.push(`${combo === 1 ? 'Line completed!' : `${combo}-line combo!`} Deal ${damage} damage!`);
        statusMessages.push(`+${lineCompletionEXP * combo} EXP! Bonus turn!`);
      } else {
        setPlayerHP(prev => Math.max(0, prev - damage));
        statusMessages.push(`Enemy deals ${damage} damage! ${combo > 1 ? `${combo}-line combo! ` : ''}Enemy gets bonus turn!`);
      }

      // Grant bonus turn for line completion - ONLY to the current player who completed the line
      // Calculate new consecutive turns after granting bonus
      const newConsecutiveTurns = consecutiveTurns + lineCompletionBonusTurns;
      
      // The player just used one turn (this current move), so we set consecutive turns
      // to the new total minus 1 (since they already made their move)
      setConsecutiveTurns(newConsecutiveTurns - 1);
      
      // Current player keeps the turn (don't switch)

      // Clear winning lines and set new board
      setTimeout(() => {
        const clearedBoard = clearWinningLines(newBoard, winningLines);
        setBoard(clearedBoard);
        setLastWinningLines([]);
      }, 1000);

      setLastWinningLines(winningLines);
    } else {
      // No line completed, check for draw
      if (checkForDraw(newBoard)) {
        setTimeout(() => {
          handleDraw();
        }, 500);
        return;
      }

      // Handle turn switching with consecutive turns for non-combo moves
      if (consecutiveTurns > 0) {
        // Player has consecutive turns remaining
        setConsecutiveTurns(prev => prev - 1);
        if (!combo) {
          // Only show extra turn message if no line was completed (combo messages already include bonus turn info)
          statusMessages.push(currentPlayer === 'X' ? 'Extra turn!' : 'Enemy extra turn!');
        }
      } else {
        // Switch turns normally
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
        if (isAIMove) {
          setIsEnemyThinking(false);
        }
      }
    }

    // Check for blocking after handling line completion
    if (isBlockingMove && currentPlayer === 'X') {
      expGained += blockEXP;
      setPlayerEXP(prev => prev + blockEXP);
      statusMessages.push(`Blocked enemy line! +${blockEXP} EXP`);
    }

    // Set the combined status message
    if (statusMessages.length > 0) {
      setStatusMessage(statusMessages.join(' '));
    }
  };

  const makeEnemyMove = useCallback(() => {
    // Simple AI: Try to win, then block player, then random move
    const findBestMove = (): [number, number] | null => {
      // Try to win
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i][j] === '') {
            const testBoard = board.map(row => [...row]);
            testBoard[i][j] = 'O';
            if (checkWinningLines(testBoard, 'O').length > 0) {
              return [i, j];
            }
          }
        }
      }

      // Try to block player
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i][j] === '') {
            const testBoard = board.map(row => [...row]);
            testBoard[i][j] = 'X';
            if (checkWinningLines(testBoard, 'X').length > 0) {
              return [i, j];
            }
          }
        }
      }

      // Random move
      const emptySpots: [number, number][] = [];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i][j] === '') {
            emptySpots.push([i, j]);
          }
        }
      }
      return emptySpots.length > 0 ? emptySpots[Math.floor(Math.random() * emptySpots.length)] : null;
    };

    const move = findBestMove();
    if (move) {
      handleCellClick(move[0], move[1], true);
    }
  }, [board, checkWinningLines]);

  // Enemy AI move with delay
  useEffect(() => {
    if (currentPlayer === 'O' && !gameOver && !showUpgradeModal) {
      setIsEnemyThinking(true);
      const timer = setTimeout(() => {
        makeEnemyMove();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameOver, showUpgradeModal, makeEnemyMove]);

  // Check for level up - only when player's turn is completely finished
  useEffect(() => {
    if (playerEXP >= maxEXP && !showUpgradeModal && consecutiveTurns === 0 && currentPlayer === 'X') {
      setPlayerEXP(prev => prev - maxEXP);
      setAvailableUpgrades(generateUpgrades());
      setShowUpgradeModal(true);
    }
  }, [playerEXP, maxEXP, showUpgradeModal, consecutiveTurns, currentPlayer, generateUpgrades]);

  // Check win/lose conditions
  useEffect(() => {
    if (enemyHP <= 0) {
      setGameOver(true);
      setWinner('Player');
      setStatusMessage('Victory! Enemy defeated!');
    } else if (playerHP <= 0) {
      setGameOver(true);
      setWinner('Enemy');
      setStatusMessage('Defeat! You have fallen in battle!');
    }
  }, [enemyHP, playerHP]);

  // Update status message based on turn
  useEffect(() => {
    if (!gameOver && !showUpgradeModal && comboCount === 0 && !statusMessage.includes('Draw!') && !statusMessage.includes('damage') && !statusMessage.includes('Upgraded:') && !statusMessage.includes('Extra turn') && !statusMessage.includes('Blocked')) {
      if (currentPlayer === 'X') {
        setStatusMessage(consecutiveTurns > 0 ? 'Bonus turn! Place your X' : 'Your turn! Place an X');
      } else if (isEnemyThinking) {
        setStatusMessage(consecutiveTurns > 0 ? 'Enemy bonus turn! Enemy thinking...' : 'Enemy is thinking...');
      }
    }
  }, [currentPlayer, gameOver, showUpgradeModal, consecutiveTurns, comboCount, isEnemyThinking, statusMessage]);

  const handleUpgradeSelect = (upgrade: Upgrade) => {
    // Close modal first to prevent any timing issues
    setShowUpgradeModal(false);
    
    // Apply the upgrade effect
    upgrade.effect();
    
    // Set appropriate status message
    if (upgrade.id === 'double_turn') {
      setStatusMessage(`${upgrade.name} activated! Extra turn available!`);
    } else {
      setStatusMessage(`Upgraded: ${upgrade.name}!`);
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
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Tic-Tac-Battle</h1>
        <div className="header-buttons">
          <button onClick={() => setShowHowToPlay(true)} className="help-button">?</button>
          <button onClick={() => setShowSettings(true)} className="settings-button">⚙</button>
        </div>
      </div>

      <div className="game-layout">
        <div className="battle-info">
          <div className="hp-bars">
            <HPBar label="You" hp={playerHP} maxHP={100} isPlayer={true} />
            <HPBar label="Enemy" hp={enemyHP} maxHP={100} isPlayer={false} />
          </div>
          <EXPBar exp={playerEXP} maxExp={maxEXP} />
        </div>

        <TicTacToeBoard 
          board={board} 
          onCellClick={(row, col) => handleCellClick(row, col, false)}
          winningLines={lastWinningLines}
          disabled={currentPlayer === 'O' || gameOver}
        />

        <StatusDisplay 
          message={statusMessage}
          currentPlayer={currentPlayer}
          comboCount={comboCount}
        />

        <button onClick={resetGame} className="restart-button">
          New Battle
        </button>
      </div>

      {showUpgradeModal && (
        <UpgradeModal
          upgrades={availableUpgrades}
          onSelect={handleUpgradeSelect}
        />
      )}

      {showSettings && (
        <SettingsModal
          soundEnabled={soundEnabled}
          onSoundToggle={setSoundEnabled}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showHowToPlay && (
        <HowToPlayOverlay onClose={() => setShowHowToPlay(false)} />
      )}

      {gameOver && (
        <GameOverModal
          winner={winner}
          onRestart={resetGame}
        />
      )}
    </div>
  );
};

export default Game;