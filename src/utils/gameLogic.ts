import { WinningLines, WinningLine } from '../types';

export const checkWinningLines = (board: string[][], player: string): WinningLines => {
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
};

export const clearWinningLines = (board: string[][], lines: WinningLines) => {
  const newBoard = board.map(row => [...row]);
  for (const line of lines) {
    for (const [row, col] of line) {
      newBoard[row][col] = '';
    }
  }
  return newBoard;
};

export const checkForDraw = (board: string[][]) => {
  // Check if board is full
  const isBoardFull = board.every(row => row.every(cell => cell !== ''));
  
  if (!isBoardFull) return false;
  
  // Check if there are any winning lines for either player
  const playerXWins = checkWinningLines(board, 'X').length > 0;
  const playerOWins = checkWinningLines(board, 'O').length > 0;
  
  // It's a draw if board is full and no one has winning lines
  return !playerXWins && !playerOWins;
};

export const checkIfMoveBlocksOpponent = (board: string[][], row: number, col: number, currentPlayer: string): boolean => {
  const opponent = currentPlayer === 'X' ? 'O' : 'X';
  
  // Create a test board with the opponent's piece at this position
  const testBoard = board.map(r => [...r]);
  testBoard[row][col] = opponent;
  
  // Check if this would create a winning line for the opponent
  const opponentWins = checkWinningLines(testBoard, opponent);
  
  return opponentWins.length > 0;
};

export const findBestMove = (board: string[][]): [number, number] | null => {
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
