import { useEffect, useCallback, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useGameState } from './useGameState';
import { checkWinningLines, clearWinningLines, checkForDraw, checkIfMoveBlocksOpponent, findBestMove } from '../utils/gameLogic';
import { Upgrade, GameMode } from '../types';

interface UseGameLogicProps {
  gameMode: GameMode;
  onBackToLevels: () => void;
}

export const useGameLogic = ({ gameMode, onBackToLevels }: UseGameLogicProps) => {
  const gameState = useGameState();
  const {
    board, setBoard,
    playerHP, setPlayerHP,
    enemyHP, setEnemyHP,
    maxPlayerHP, setMaxPlayerHP,
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
    setGoldPiece,
    triggerParticles,
    triggerFloatingText,
    resetGame,
    triggerShake
  } = gameState;

  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Game balance parameters
  const baseDamage = 15;
  const comboDamageMultiplier = 1.5;
  const drawDamage = 10;
  const lineCompletionEXP = 49;
  const blockEXP = 33;
  const lineCompletionBonusTurns = 1;

  // Handler for Game Over Logic
  const triggerGameOver = useCallback((winnerName: string) => {
    setGameOver(true);
    setWinner(winnerName);
    
    let message = '';
    if (gameMode === 'local_multiplayer') {
        message = winnerName === 'Player' ? 'Player 1 Wins!' : 'Player 2 Wins!';
    } else {
        message = winnerName === 'Player' ? 'Victory! Enemy defeated!' : 'Defeat! You have fallen in battle!';
    }
    setStatusMessage(message);
    
    if (winnerName === 'Player' || (gameMode === 'local_multiplayer' && winnerName === 'Enemy')) {
        confetti({
            particleCount: 200,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#FF4500', '#00FF00', '#00BFFF']
        });
    }
  }, [setGameOver, setWinner, setStatusMessage, gameMode]);

  const handleDraw = useCallback(() => {
    if (gameOver) return;

    const newPlayerHP = Math.max(0, playerHP - drawDamage);
    const newEnemyHP = Math.max(0, enemyHP - drawDamage);
    
    setPlayerHP(newPlayerHP);
    setEnemyHP(newEnemyHP);
    triggerShake();

    const isPlayerDead = newPlayerHP <= 0;
    const isEnemyDead = newEnemyHP <= 0;

    setIsClearing(true);

    triggerFloatingText(
      `DRAW! -${drawDamage}`, 
      0, 
      0, 
      '#ff4444', 
      () => {
        if (isPlayerDead || isEnemyDead) {
            setIsClearing(false);
            if (isPlayerDead && isEnemyDead) {
                triggerGameOver('Enemy');
                triggerFloatingText('DEFEAT!', 0, 0, '#ff4444');
            } else if (isPlayerDead) {
                triggerGameOver('Enemy');
                triggerFloatingText(gameMode === 'local_multiplayer' ? 'P2 WINS!' : 'DEFEAT!', 0, 0, '#ff4444');
            } else {
                triggerGameOver('Player');
                triggerFloatingText(gameMode === 'local_multiplayer' ? 'P1 WINS!' : 'VICTORY!', 0, 0, '#00ff66');
            }
        } else {
            setTimeout(() => {
                setBoard(Array(3).fill(null).map(() => Array(3).fill('')));
                setIsClearing(false);
                setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
                setConsecutiveTurns(0);
                setStatusMessage(`Draw! Both players take ${drawDamage} damage. Board reset.`);
                setLastWinningLines([]);
                setComboCount(0);
                
                // Buffs are NOT cleared here as per instruction
            }, 500);
        }
      }
    );
  }, [gameOver, playerHP, enemyHP, drawDamage, triggerFloatingText, setPlayerHP, setEnemyHP, triggerShake, triggerGameOver, setBoard, setCurrentPlayer, setConsecutiveTurns, setStatusMessage, setLastWinningLines, setComboCount, gameMode, currentPlayer]);

  const generateUpgrades = useCallback((): Upgrade[] => {
    const allUpgrades: Upgrade[] = [
      {
        id: 'heal_small',
        name: 'Potion',
        description: 'Heal 30 HP instantly.',
        effect: () => {
          setPlayerHP(prev => Math.min(maxPlayerHP, prev + 30));
          triggerFloatingText('+30 HP', 0, 0, '#00ff66');
        }
      },
      {
        id: 'heal_max_boost',
        name: 'Vitality Elixir',
        description: '+20 Max HP and heal to full.',
        effect: () => {
          setMaxPlayerHP(prev => {
             const newMax = prev + 20;
             setPlayerHP(newMax);
             return newMax;
          });
          triggerFloatingText('MAX HP UP!', 0, 0, '#00ff66');
        }
      },
      {
        id: 'double_turn',
        name: 'Adrenaline Rush',
        description: 'Take an extra turn immediately.',
        effect: () => setConsecutiveTurns(prev => prev + 1)
      },
      {
        id: 'clear_enemy',
        name: 'Sabotage',
        description: 'Destroy a random enemy piece.',
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
          triggerFloatingText('SABOTAGE!', 0, 0, '#ff9900');
        }
      },
      {
        id: 'clear_board_preserve_self',
        name: 'Earthquake',
        description: 'Clear all enemy pieces from the board.',
        effect: () => {
             setBoard(prev => {
                return prev.map(row => row.map(cell => cell === 'O' ? '' : cell));
             });
             triggerFloatingText('QUAKE!', 0, 0, '#ff9900');
        }
      },
      {
        id: 'damage_boost_small',
        name: 'Sharpened Blade',
        description: 'Next attack deals +15 bonus damage.',
        effect: () => {
          setNextTurnDamageBonus(prev => prev + 15);
          setStatusMessage('Weapon Sharpened! +15 Damage on next hit.');
        }
      },
      {
        id: 'damage_boost_large',
        name: 'Power Charge',
        description: 'Next attack deals +30 bonus damage.',
        effect: () => {
          setNextTurnDamageBonus(prev => prev + 30);
          setStatusMessage('Power Charged! +30 Damage on next hit.');
        }
      },
      {
         id: 'defense_shield',
         name: 'Iron Skin',
         description: 'Reduce next incoming damage by 50%.',
         effect: () => {
             setNextTurnDamageReduction(0.5);
             setStatusMessage('Iron Skin Active! 50% damage reduction next hit.');
         }
      },
      {
         id: 'instant_exp',
         name: 'Knowledge Scroll',
         description: 'Gain 50 EXP instantly.',
         effect: () => {
             setPlayerEXP(prev => prev + 50);
             triggerFloatingText('+50 EXP', 0, 0, '#00ccff');
         }
      }
    ];

    const shuffled = allUpgrades.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [triggerFloatingText, setPlayerHP, maxPlayerHP, setMaxPlayerHP, setConsecutiveTurns, setBoard, setNextTurnDamageBonus, setNextTurnDamageReduction, setPlayerEXP, setStatusMessage]);

  const handleCellClick = (row: number, col: number, event: React.MouseEvent<HTMLButtonElement> | { clientX: number, clientY: number }, isAIMove: boolean = false) => {
    if (board[row][col] !== '' || gameOver || isClearing) return;
    if (!isAIMove && currentPlayer === 'O' && gameMode === 'singleplayer') return;
    if (isAIMove && currentPlayer === 'X') return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    
    const isBlockingMove = currentPlayer === 'X' && checkIfMoveBlocksOpponent(board, row, col, currentPlayer);
    const winningLines = checkWinningLines(newBoard, currentPlayer);
    const combo = winningLines.length;

    let damage = 0;
    let nextEnemyHP = enemyHP;
    let nextPlayerHP = playerHP;
    
    if (combo > 0) {
      damage = baseDamage * combo;
      if (combo > 1) {
        damage = Math.floor(damage * comboDamageMultiplier);
      }
      if (currentPlayer === 'X' && nextTurnDamageBonus > 0) {
          damage += nextTurnDamageBonus;
      }
      if (currentPlayer === 'O' && nextTurnDamageReduction > 0) {
          damage = Math.floor(damage * (1 - nextTurnDamageReduction));
      }

      if (currentPlayer === 'X') {
        nextEnemyHP = Math.max(0, enemyHP - damage);
      } else {
        nextPlayerHP = Math.max(0, playerHP - damage);
      }
    }

    const isDraw = !combo && checkForDraw(newBoard);
    const isWin = nextEnemyHP <= 0;
    const isLose = nextPlayerHP <= 0;
    const isGameOver = isWin || isLose || isDraw;

    setBoard(newBoard);
    setComboCount(combo);
    setEnemyHP(nextEnemyHP);
    setPlayerHP(nextPlayerHP);

    let expGained = 0;
    let statusMessages: string[] = [];
    let shouldTriggerGoldEffect = false;

    // Only Player (X) gets EXP for blocking
    if (isBlockingMove && currentPlayer === 'X') {
      expGained += blockEXP;
      shouldTriggerGoldEffect = true;
      if (gameMode === 'singleplayer') statusMessages.push(`Blocked enemy line! +${blockEXP} EXP`);
      else statusMessages.push(`Blocked!`);
    }

    if (combo > 0) {
        const attackerName = currentPlayer === 'X' ? (gameMode === 'local_multiplayer' ? 'Player 1' : 'You') : (gameMode === 'local_multiplayer' ? 'Player 2' : 'Enemy');
        
        // Only Player (X) gets EXP for lines
        if (currentPlayer === 'X') {
            const lineExp = lineCompletionEXP * combo;
            expGained += lineExp;
            shouldTriggerGoldEffect = true;
        }

        statusMessages.push(`${combo === 1 ? 'Line completed!' : `${combo}-line combo!`} ${attackerName} deals ${damage} damage!`);
        if (gameMode === 'singleplayer' && currentPlayer === 'X') {
            const lineExp = lineCompletionEXP * combo;
            statusMessages.push(`+${lineExp} EXP! Bonus turn!`);
        } else {
            statusMessages.push('Bonus turn!');
        }
        
        if (currentPlayer === 'X' && nextTurnDamageBonus > 0) {
             setNextTurnDamageBonus(0);
             statusMessages.push('Bonus Damage Applied!');
        }
        if (currentPlayer === 'O' && nextTurnDamageReduction > 0) {
             setNextTurnDamageReduction(0);
             statusMessages.push('Shield blocked damage!');
        }

        const newConsecutiveTurns = consecutiveTurns + lineCompletionBonusTurns;
        setConsecutiveTurns(newConsecutiveTurns - 1);
        
        setIsClearing(true);
        setTimeout(() => {
            const clearedBoard = clearWinningLines(newBoard, winningLines);
            setBoard(clearedBoard);
            setLastWinningLines([]);
            setIsClearing(false);
        }, 1000);
        setLastWinningLines(winningLines);
    } else {
        if (consecutiveTurns > 0) {
            setConsecutiveTurns(prev => prev - 1);
        } else if (!isDraw) {
            setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
            if (isAIMove) {
                setIsEnemyThinking(false);
            }
        }
    }
    
    // Final check to ensure only the player gets EXP
    if (expGained > 0 && gameMode === 'singleplayer' && currentPlayer === 'X') {
        setPlayerEXP(prev => prev + expGained);
    }

    if (isBlockingMove && currentPlayer === 'X' && !isGameOver) {
        triggerFloatingText('BLOCKED!', 0, 0, '#00ccff');
    }

    if (combo > 0) {
         if (currentPlayer === 'X') {
            if (combo > 1) {
                triggerFloatingText(`${combo}x COMBO! -${damage}`, 0, 0, '#ffdd00');
            } else {
                triggerFloatingText(`HIT! -${damage}`, 0, 0, '#ffdd00');
            }
         } else {
             if (combo > 1) {
                triggerFloatingText(`${gameMode === 'local_multiplayer' ? 'P2' : 'ENEMY'} COMBO! -${damage}`, 0, 0, '#ff4444');
             } else {
                triggerFloatingText(`HIT! -${damage}`, 0, 0, '#ff4444');
             }
         }
    }

    if (isDraw) {
        handleDraw();
    }

    if (consecutiveTurns > 0 && !combo && !isDraw && !isGameOver) {
         statusMessages.push('Extra turn!');
         triggerFloatingText('Extra Turn!', 0, 0, '#00ccff');
    }

    if (isWin) {
         triggerFloatingText(gameMode === 'local_multiplayer' ? 'P1 WINS!' : 'VICTORY!', 0, 0, '#00ff66', () => triggerGameOver('Player'));
    } else if (isLose) {
         triggerFloatingText(gameMode === 'local_multiplayer' ? 'P2 WINS!' : 'DEFEAT!', 0, 0, '#ff4444', () => triggerGameOver('Enemy'));
    }

    if (shouldTriggerGoldEffect) {
       const clientX = 'clientX' in event ? event.clientX : window.innerWidth / 2;
       const clientY = 'clientY' in event ? event.clientY : window.innerHeight / 2;
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
  }, [board, handleCellClick]);

  useEffect(() => {
    if (gameMode === 'singleplayer' && currentPlayer === 'O' && !gameOver && !showUpgradeModal && !showLevelUpAnimation && !isClearing) {
      setIsEnemyThinking(true);
      const timer = setTimeout(() => {
        makeEnemyMove();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameOver, showUpgradeModal, showLevelUpAnimation, makeEnemyMove, gameMode, isClearing]);

  useEffect(() => {
    if (gameMode === 'singleplayer' && playerEXP >= maxEXP && !showUpgradeModal && !showLevelUpAnimation && consecutiveTurns === 0 && currentPlayer === 'X') {
      setPlayerEXP(prev => prev - maxEXP);
      setAvailableUpgrades(generateUpgrades());
      setShowLevelUpAnimation(true);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF4500', '#00FF00', '#00BFFF']
      });

      setTimeout(() => {
        setShowLevelUpAnimation(false);
        setShowUpgradeModal(true);
      }, 2000);
    }
  }, [playerEXP, maxEXP, showUpgradeModal, showLevelUpAnimation, consecutiveTurns, currentPlayer, generateUpgrades, gameMode]);

  useEffect(() => {
    if (!gameOver && !showUpgradeModal && !showLevelUpAnimation && comboCount === 0) {
       const isSpecialMessage = statusMessage.includes('Draw!') || 
                                statusMessage.includes('damage') || 
                                statusMessage.includes('Upgraded:') || 
                                statusMessage.includes('Extra turn') || 
                                statusMessage.includes('Blocked');
                                
       if (!isSpecialMessage) {
          if (currentPlayer === 'X') {
             setStatusMessage(consecutiveTurns > 0 ? (gameMode === 'local_multiplayer' ? 'Player 1 Bonus turn!' : 'Bonus turn! Place your X') : (gameMode === 'local_multiplayer' ? 'Player 1 Turn (X)' : 'Your turn! Place an X'));
          } else {
             if (gameMode === 'local_multiplayer') {
                  setStatusMessage(consecutiveTurns > 0 ? 'Player 2 Bonus turn!' : 'Player 2 Turn (O)');
             } else if (isEnemyThinking) {
                  setStatusMessage(consecutiveTurns > 0 ? 'Enemy bonus turn! Enemy thinking...' : 'Enemy is thinking...');
             }
          }
       }
    }
  }, [currentPlayer, gameOver, showUpgradeModal, showLevelUpAnimation, consecutiveTurns, comboCount, isEnemyThinking, statusMessage, gameMode]);

  const handleUpgradeSelect = (upgrade: Upgrade) => {
    setShowUpgradeModal(false);
    upgrade.effect();
    if (upgrade.id === 'double_turn') {
      setStatusMessage(`${upgrade.name} activated! Extra turn available!`);
    } else {
      setStatusMessage(`Upgraded: ${upgrade.name}!`);
    }
  };

  return {
    ...gameState,
    showLevelUpAnimation,
    isClearing,
    handleCellClick,
    handleUpgradeSelect
  };
};
