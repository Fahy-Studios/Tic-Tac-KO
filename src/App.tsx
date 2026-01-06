import React, { useState } from 'react';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import LevelsPage from './components/LevelsPage';
import { GameMode } from './types';
import './index.css';
import './styles/buffs.css';

type Screen = 'start' | 'levels' | 'game';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameMode, setGameMode] = useState<GameMode>('singleplayer');

  const handleStartCampaign = () => {
    setGameMode('singleplayer');
    setCurrentScreen('levels');
  };

  const handleStartLocalMultiplayer = () => {
    setGameMode('local_multiplayer');
    setCurrentScreen('game');
  };

  const handleLevelSelect = (level: number) => {
    setCurrentLevel(level);
    setCurrentScreen('game');
  };

  const handleBackToLevels = () => {
    if (gameMode === 'singleplayer') {
      setCurrentScreen('levels');
    } else {
      setCurrentScreen('start');
    }
  };

  const handleBackToStart = () => {
    setCurrentScreen('start');
  };

  return (
    <div className="app-container">
      {currentScreen === 'start' && (
        <StartScreen 
          onStart={handleStartCampaign} 
          onLocalMultiplayer={handleStartLocalMultiplayer}
        />
      )}
      {currentScreen === 'levels' && (
        <LevelsPage 
            onLevelSelect={handleLevelSelect} 
            onBack={handleBackToStart}
        />
      )}
      {currentScreen === 'game' && (
        <Game 
            gameMode={gameMode}
            onBackToLevels={handleBackToLevels}
        />
      )}
    </div>
  );
}

export default App;
