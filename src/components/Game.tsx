import React, { useEffect, useCallback, useRef, useState } from 'react';
import TicTacToeBoard from './TicTacToeBoard';
import HPBar from './HPBar';
import EXPBar from './EXPBar';
import StatusDisplay from './StatusDisplay';
import UpgradeModal from './UpgradeModal';
import SettingsModal from './SettingsModal';
import HowToPlayOverlay from './HowToPlayOverlay';
import GameOverModal from './GameOverModal';
import ParticleSystem from './ParticleSystem';
import FloatingText from './FloatingText';
import { useGameState } from '../hooks/useGameState';
import { checkWinningLines, clearWinningLines, checkForDraw, checkIfMoveBlocksOpponent, findBestMove } from '../utils/gameLogic';
import { Upgrade } from '../types';

const Game: React.FC = () => {
  const {
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
    resetGame,
    isShaking, triggerShake
  } = useGameState();

  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const expBarRef = useRef<HTMLDivElement>(null);

  // Game balance parameters
  const baseDamage = 15;
  const comboDamageMultiplier = 1.5;
  const drawDamage = 10;
  const lineCompletionEXP = 49;
  const blockEXP = 33;
  const lineCompletionBonusTurns = 1;

  // Handler for Game Over Logic - now triggered via callbacks
  const triggerGameOver = useCallback((winnerName: string) => {
    setGameOver(true);
    setWinner(winnerName);
    setStatusMessage(winnerName === 'Player' ? 'Victory! Enemy defeated!' : 'Defeat! You have fallen in battle!');
  }, [setGameOver, setWinner, setStatusMessage]);

  const handleDraw = useCallback(() => {
    // Only queue draw sequence if game isn't already over
    if (gameOver) return;

    // Apply draw damage and shake
    setPlayerHP(prev => Math.max(0, prev - drawDamage));
    setEnemyHP(prev => Math.max(0, prev - drawDamage));
    triggerShake();

    // Queue the DRAW text with callback to reset board
    triggerFloatingText(
      `DRAW! -${drawDamage}`, 
      0, 
      0, 
      '#ff4444', 
      () => {
        // This runs AFTER the text finishes
        setBoard(Array(3).fill(null).map(() => Array(3).fill('')));
        setCurrentPlayer('X');
        setConsecutiveTurns(0);
        setStatusMessage(`Draw! Both players take ${drawDamage} damage. Board reset.`);
        setLastWinningLines([]);
        setComboCount(0);
      }
    );
  }, [drawDamage, triggerFloatingText, setPlayerHP, setEnemyHP, setBoard, setCurrentPlayer, setConsecutiveTurns, setStatusMessage, setLastWinningLines, setComboCount, gameOver, triggerShake]);

  const generateUpgrades = useCallback((): Upgrade[] => {
    const allUpgrades: Upgrade[] = [
      {
        id: 'heal',
        name: 'Battle Heal',
        description: 'Restore 25 HP',
        effect: () => {
          setPlayerHP(prev => Math.min(100, prev + 25));
          triggerFloatingText('+25 HP', 0, 0, '#00ff66');
        }
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
          setStatusMessage('Next line will deal bonus damage!');
        }
      }
    ];
    const shuffled = allUpgrades.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [triggerFloatingText, setPlayerHP, setConsecutiveTurns, setBoard, setStatusMessage]);

  const handleCellClick = (row: number, col: number, event: React.MouseEvent<HTMLButtonElement> | { clientX: number, clientY: number }, isAIMove: boolean = false) => {
    if (board[row][col] !== '' || gameOver) return;
    if (!isAIMove && currentPlayer === 'O') return;
    if (isAIMove && currentPlayer === 'X') return;

    const isBlockingMove = currentPlayer === 'X' && checkIfMoveBlocksOpponent(board, row, col, currentPlayer);
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    const winningLines = checkWinningLines(newBoard, currentPlayer);
    const combo = winningLines.length;
    setComboCount(combo);

    let expGained = 0;
    let statusMessages: string[] = [];
    const clientX = 'clientX' in event ? event.clientX : window.innerWidth / 2;
    const clientY = 'clientY' in event ? event.clientY : window.innerHeight / 2;
    let shouldTriggerGoldEffect = false;

    // We track projected HP to determine if game ends this turn
    let nextEnemyHP = enemyHP;
    let nextPlayerHP = playerHP;

    if (combo > 0) {
      let damage = baseDamage * combo;
      if (combo > 1) {
        damage = Math.floor(damage * comboDamageMultiplier);
      }

      // Trigger shake on any damage
      triggerShake();

      if (currentPlayer === 'X') {
        nextEnemyHP = Math.max(0, enemyHP - damage);
        setEnemyHP(nextEnemyHP);
        const lineExp = lineCompletionEXP * combo;
        expGained += lineExp;
        setPlayerEXP(prev => prev + expGained);
        
        if (combo > 1) {
            triggerFloatingText(`${combo}x COMBO! -${damage}`, 0, 0, '#ffdd00');
        } else {
            triggerFloatingText(`HIT! -${damage}`, 0, 0, '#ffdd00');
        }
        shouldTriggerGoldEffect = true;
        statusMessages.push(`${combo === 1 ? 'Line completed!' : `${combo}-line combo!`} Deal ${damage} damage!`);
        statusMessages.push(`+${lineExp} EXP! Bonus turn!`);
      } else {
        nextPlayerHP = Math.max(0, playerHP - damage);
        setPlayerHP(nextPlayerHP);
        if (combo > 1) {
            triggerFloatingText(`ENEMY COMBO! -${damage}`, 0, 0, '#ff4444');
        } else {
            triggerFloatingText(`OUCH! -${damage}`, 0, 0, '#ff4444');
        }
        statusMessages.push(`Enemy deals ${damage} damage! ${combo > 1 ? `${combo}-line combo! ` : ''}Enemy gets bonus turn!`);
      }

      const newConsecutiveTurns = consecutiveTurns + lineCompletionBonusTurns;
      setConsecutiveTurns(newConsecutiveTurns - 1);

      setTimeout(() => {
        const clearedBoard = clearWinningLines(newBoard, winningLines);
        setBoard(clearedBoard);
        setLastWinningLines([]);
      }, 1000);
      setLastWinningLines(winningLines);
    } else {
      // Non-winning move logic
      // Check for draw
      let isDraw = checkForDraw(newBoard);
      
      // If NOT a draw, or if it is a draw we still handle turn logic (Draw handler is queued separately)
      if (consecutiveTurns > 0) {
        setConsecutiveTurns(prev => prev - 1);
        if (!combo && !isDraw) { // Only show extra turn if not draw
          statusMessages.push(currentPlayer === 'X' ? 'Extra turn!' : 'Enemy extra turn!');
          triggerFloatingText('Extra Turn!', 0, 0, '#00ccff');
        }
      } else if (!isDraw) {
        // Only switch turns if NOT a draw
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
        if (isAIMove) {
          setIsEnemyThinking(false);
        }
      }

      // If it IS a draw, schedule the draw handler
      if (isDraw) {
         // We do NOT return here, so blocking logic below can still run
         // The draw handler will run later due to queue
         handleDraw(); 
      }
    }

    if (isBlockingMove && currentPlayer === 'X') {
      expGained += blockEXP;
      setPlayerEXP(prev => prev + blockEXP);
      triggerFloatingText('BLOCKED!', 0, 0, '#00ccff');
      shouldTriggerGoldEffect = true;
      statusMessages.push(`Blocked enemy line! +${blockEXP} EXP`);
    }

    // Check Win/Lose Conditions and Queue them
    if (nextEnemyHP <= 0) {
      triggerFloatingText('VICTORY!', 0, 0, '#00ff66', () => triggerGameOver('Player'));
    } else if (nextPlayerHP <= 0) {
      triggerFloatingText('DEFEAT!', 0, 0, '#ff4444', () => triggerGameOver('Enemy'));
    }

    if (shouldTriggerGoldEffect) {
      setGoldPiece([row, col]);
      setTimeout(() => {
        triggerParticles(clientX, clientY, '#ffdd00');
        setGoldPiece(null);
      }, 500);
    }
    if (statusMessages.length > 0) {
      setStatusMessage(statusMessages.join(' '));
    }
  };

  const makeEnemyMove = useCallback(() => {
    const move = findBestMove(board);
    if (move) {
      const rect = document.querySelector('.tic-tac-toe-board')?.getBoundingClientRect();
      let clientX = window.innerWidth / 2;
      let clientY = window.innerHeight / 2;
      if (rect) {
          const cellWidth = rect.width / 3;
          const cellHeight = rect.height / 3;
          clientX = rect.left + (move[1] * cellWidth) + (cellWidth / 2);
          clientY = rect.top + (move[0] * cellHeight) + (cellHeight / 2);
      }
      handleCellClick(move[0], move[1], { clientX, clientY }, true);
    }
  }, [board]); // Removed checkWinningLines from dependencies as it's not used directly here or is stable

  // Enemy AI move
  useEffect(() => {
    if (currentPlayer === 'O' && !gameOver && !showUpgradeModal) {
      setIsEnemyThinking(true);
      const timer = setTimeout(() => {
        makeEnemyMove();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameOver, showUpgradeModal, makeEnemyMove]);

  // Check for level up
  useEffect(() => {
    if (playerEXP >= maxEXP && !showUpgradeModal && consecutiveTurns === 0 && currentPlayer === 'X') {
      setPlayerEXP(prev => prev - maxEXP);
      setAvailableUpgrades(generateUpgrades());
      setShowUpgradeModal(true);
    }
  }, [playerEXP, maxEXP, showUpgradeModal, consecutiveTurns, currentPlayer, generateUpgrades]);

  // Update status message
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
    setShowUpgradeModal(false);
    upgrade.effect();
    if (upgrade.id === 'double_turn') {
      setStatusMessage(`${upgrade.name} activated! Extra turn available!`);
    } else {
      setStatusMessage(`Upgraded: ${upgrade.name}!`);
    }
  };

  return (
    <div className={`game-container ${isShaking ? 'shake' : ''}`}>
      <ParticleSystem events={particleEvents} targetRef={expBarRef} />
      {floatingTexts.map(ft => (
        <FloatingText
          key={ft.id}
          id={ft.id}
          text={ft.text}
          x={ft.x}
          y={ft.y}
          color={ft.color}
          onComplete={handleFloatingTextComplete}
        />
      ))}
      
      <div className="game-header">
        <h1>Tic-Tac-KO</h1>
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
          <div ref={expBarRef} style={{ position: 'relative' }}>
            <EXPBar exp={playerEXP} maxExp={maxEXP} />
          </div>
        </div>

        <TicTacToeBoard 
          board={board} 
          onCellClick={(row, col, e) => handleCellClick(row, col, e)}
          winningLines={lastWinningLines}
          disabled={currentPlayer === 'O' || gameOver}
          goldPiece={goldPiece}
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
