export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  backgroundClass: string; // CSS class for theming
  enemyHP: number;
  aiDifficulty: 'easy' | 'medium' | 'hard' | 'cheater';
  aiAbility?: 'erase' | 'double_move'; // Special abilities
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "The Beginning",
    description: "A fresh sheet of paper. Your journey begins here.",
    backgroundClass: "theme-paper",
    enemyHP: 100,
    aiDifficulty: 'easy'
  },
  {
    id: 2,
    name: "The Sketchbook",
    description: "Things are getting messy. Watch out for aggressive strokes.",
    backgroundClass: "theme-sketchbook",
    enemyHP: 120,
    aiDifficulty: 'medium'
  },
  {
    id: 3,
    name: "The Blueprint",
    description: " precise calculations required. The enemy defends well.",
    backgroundClass: "theme-blueprint",
    enemyHP: 150,
    aiDifficulty: 'hard'
  },
  {
    id: 4,
    name: "The Final Exam",
    description: "The teacher is watching. Rules might be broken.",
    backgroundClass: "theme-exam",
    enemyHP: 200,
    aiDifficulty: 'cheater',
    aiAbility: 'erase'
  }
];
