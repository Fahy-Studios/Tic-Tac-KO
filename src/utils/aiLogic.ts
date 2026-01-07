import { checkWinningLines } from './gameLogic';

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'cheater';

// Helper to find all empty spots
const getEmptySpots = (board: string[][]): [number, number][] => {
  const spots: [number, number][] = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === '') {
        spots.push([i, j]);
      }
    }
  }
  return spots;
};

// Standard Minimax or Heuristic Move Finder
export const findBestMove = (board: string[][], difficulty: AIDifficulty): [number, number] | null => {
  const emptySpots = getEmptySpots(board);
  if (emptySpots.length === 0) return null;

  // 1. Check for Immediate Win (Priority 1)
  for (const [r, c] of emptySpots) {
    const testBoard = board.map(row => [...row]);
    testBoard[r][c] = 'O';
    if (checkWinningLines(testBoard, 'O').length > 0) {
      return [r, c];
    }
  }

  // 2. Check for Immediate Block (Priority 2)
  // Easy AI sometimes misses blocks (30% chance to skip this step)
  const shouldBlock = difficulty === 'easy' ? Math.random() > 0.3 : true;
  
  if (shouldBlock) {
    for (const [r, c] of emptySpots) {
        const testBoard = board.map(row => [...row]);
        testBoard[r][c] = 'X';
        if (checkWinningLines(testBoard, 'X').length > 0) {
        return [r, c];
        }
    }
  }

  // 3. Strategic Center (Medium/Hard)
  if (difficulty !== 'easy') {
    if (board[1][1] === '') return [1, 1];
  }

  // 4. Strategic Corners (Hard/Cheater)
  if (difficulty === 'hard' || difficulty === 'cheater') {
    const corners: [number, number][] = [[0, 0], [0, 2], [2, 0], [2, 2]];
    const availableCorners = corners.filter(([r, c]) => board[r][c] === '');
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
  }

  // 5. Random Random
  return emptySpots[Math.floor(Math.random() * emptySpots.length)];
};

// Special Ability: Eraser
// Returns the coordinates of a player's piece to remove, or null if none found/ability fails
export const getEraserMove = (board: string[][]): [number, number] | null => {
    // 20% chance to use eraser on any given turn if there are player pieces
    if (Math.random() > 0.2) return null;

    const playerSpots: [number, number][] = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === 'X') {
                playerSpots.push([i, j]);
            }
        }
    }

    if (playerSpots.length === 0) return null;
    return playerSpots[Math.floor(Math.random() * playerSpots.length)];
};
