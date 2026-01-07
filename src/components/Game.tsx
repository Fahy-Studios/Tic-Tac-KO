import React, { useRef } from 'react';
import TicTacToeBoard from './TicTacToeBoard';
import HPBar from './HPBar';
import EXPBar from './EXPBar';
import StatusDisplay from './StatusDisplay';
import UpgradeModal from './UpgradeModal';
import GameOverModal from './GameOverModal';
import ParticleSystem from './ParticleSystem';
import FloatingText from './FloatingText';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameMode } from '../types';
import { useSound } from '../hooks/useSound';

interface GameProps {
  onBackToLevels: () => void;
  gameMode?: GameMode;
  initialLevelId?: number;
}

const Game: React.FC<GameProps> = ({ onBackToLevels, gameMode = 'singleplayer', initialLevelId }) => {
  const {
    board,
    playerHP,
    enemyHP,
    maxPlayerHP,
    maxEnemyHP,
    nextTurnDamageBonus,
    nextTurnDamageReduction,
    currentPlayer,
    playerEXP,
    maxEXP,
    gameOver,
    winner,
    lastWinningLines,
    availableUpgrades,
    showUpgradeModal,
    comboCount,
    statusMessage,
    goldPiece,
    particleEvents,
    floatingTexts, handleFloatingTextComplete,
    resetGame,
    isShaking,
    showLevelUpAnimation,
    isClearing,
    handleCellClick,
    handleUpgradeSelect,
    currentLevelConfig
  } = useGameLogic({ gameMode, onBackToLevels, initialLevelId });
  
  const { playClick } = useSound();
  const expBarRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    playClick();
    resetGame();
  };

  const handleBack = () => {
    playClick();
    onBackToLevels();
  };

  return (
    <div className="game-entry-wrapper">
      <div 
        className={`game-container ${isShaking ? 'shake' : ''} ${gameMode === 'local_multiplayer' ? 'local-multiplayer' : ''} ${gameMode === 'singleplayer' ? currentLevelConfig.backgroundClass : ''}`}
      >
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
        
        {/* Header */}
        <div className="game-header">
           <h1>{gameMode === 'singleplayer' ? `${currentLevelConfig.name}` : 'Tic-Tac-KO'}</h1>
           <div className="header-buttons">
            <button onClick={handleReset} className="restart-icon-button" title="Restart Game">↻</button>
            <button onClick={handleBack} className="levels-button">☰</button>
           </div>
        </div>

        {gameMode === 'local_multiplayer' ? (
          // Multiplayer Layout
          <>
              <div className="player-area player-2-area">
                  <div className="player-row">
                      <HPBar 
                          label="Player 2" 
                          hp={enemyHP} 
                          maxHP={100} 
                          isPlayer={false}
                          className="rotated"
                      />
                      <div className={`turn-indicator-icon rotated ${currentPlayer === 'O' ? 'active' : ''}`}>O</div>
                  </div>
              </div>

              <TicTacToeBoard 
                  board={board} 
                  onCellClick={(row, col, e) => handleCellClick(row, col, e)}
                  winningLines={lastWinningLines}
                  disabled={gameOver}
                  goldPiece={goldPiece}
                  isClearing={isClearing}
              />

              <div className="player-area player-1-area">
                  <div className="player-row">
                      <div className={`turn-indicator-icon ${currentPlayer === 'X' ? 'active' : ''}`}>X</div>
                      <HPBar 
                          label="Player 1" 
                          hp={playerHP} 
                          maxHP={maxPlayerHP} 
                          isPlayer={true} 
                      />
                  </div>
              </div>
          </>
        ) : (
          // Singleplayer Layout
          <div className="game-layout">
              <div className="battle-info">
              <div className="hp-bars">
                  <HPBar 
                      label="You" 
                      hp={playerHP} 
                      maxHP={maxPlayerHP} 
                      isPlayer={true} 
                  />
                  <HPBar 
                      label="Enemy" 
                      hp={enemyHP} 
                      maxHP={maxEnemyHP} 
                      isPlayer={false}
                  />
              </div>
              <div ref={expBarRef} style={{ position: 'relative' }}>
                  <EXPBar exp={playerEXP} maxExp={maxEXP} />
              </div>
              </div>

              <TicTacToeBoard 
              board={board} 
              onCellClick={(row, col, e) => handleCellClick(row, col, e)}
              winningLines={lastWinningLines}
              disabled={(currentPlayer === 'O') || gameOver || showLevelUpAnimation}
              goldPiece={goldPiece}
              isClearing={isClearing}
              />

              <StatusDisplay 
              message={statusMessage}
              currentPlayer={currentPlayer}
              comboCount={comboCount}
              />
              
              {(nextTurnDamageBonus > 0 || nextTurnDamageReduction > 0) && (
                  <div className="buff-indicators">
                      {nextTurnDamageBonus > 0 && <span className="buff damage-buff">⚔️ +{nextTurnDamageBonus} DMG</span>}
                      {nextTurnDamageReduction > 0 && <span className="buff defense-buff">🛡️ Shielded</span>}
                  </div>
              )}
          </div>
        )}

        {showLevelUpAnimation && (
          <div className="level-up-overlay">
             <h1 className="level-up-text">LEVEL UP!</h1>
          </div>
        )}

        {showUpgradeModal && (
          <UpgradeModal
            upgrades={availableUpgrades}
            onSelect={handleUpgradeSelect}
          />
        )}

        {gameOver && (
          <GameOverModal
            winner={winner}
            onRestart={handleReset}
            isMultiplayer={gameMode === 'local_multiplayer'}
          />
        )}
      </div>
    </div>
  );
};

export default Game;
