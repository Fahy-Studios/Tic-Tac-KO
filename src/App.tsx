import React, { useState } from 'react';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import LevelsPage from './components/LevelsPage';
import './index.css';
import './styles/buffs.css';

type Screen = 'start' | 'levels' | 'game';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [currentLevel, setCurrentLevel] = useState(1);

  const handleStart = () => setCurrentScreen('levels');
  const handleLevelSelect = (level: number) => {
    setCurrentLevel(level);
    setCurrentScreen('game');
  };
  const handleBackToLevels = () => setCurrentScreen('levels');

  return (
    <div className="app-container">
      {currentScreen === 'start' && <StartScreen onStart={handleStart} />}
      {currentScreen === 'levels' && (
        <LevelsPage 
            onLevelSelect={handleLevelSelect} 
        />
      )}
      {currentScreen === 'game' && (
        <Game 
            onBackToLevels={handleBackToLevels}
        />
      )}
    </div>
  );
}

export default App;
