import React from 'react';
import { WinningLines } from '../types';

interface TicTacToeBoardProps {
  board: string[][];
  onCellClick: (row: number, col: number, event: React.MouseEvent<HTMLButtonElement>) => void;
  winningLines: WinningLines;
  disabled: boolean;
  goldPiece: [number, number] | null;
  isClearing?: boolean;
}

const SketchyX = () => (
  <svg viewBox="0 0 100 100" className="sketch-mark sketch-x">
    {/* Stroke 1: Top-left to bottom-right, slightly curved */}
    <path d="M 25 25 Q 45 45 75 75" className="sketch-stroke stroke-1" style={{ transform: 'rotate(-2deg)', transformOrigin: 'center' }} />
    {/* Stroke 2: Top-right to bottom-left, slightly curved differently */}
    <path d="M 75 25 Q 55 55 25 75" className="sketch-stroke stroke-2" style={{ transform: 'rotate(2deg)', transformOrigin: 'center' }} />
  </svg>
);

const SketchyO = () => (
  <svg viewBox="0 0 100 100" className="sketch-mark sketch-o">
    {/* Hand-drawn circle that loops slightly past the start */}
    <path d="M 50 15 C 80 15 90 45 85 65 C 75 90 40 90 25 75 C 10 55 20 25 40 18 C 50 14 60 20 60 20" className="sketch-stroke" />
  </svg>
);

const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({ 
  board, 
  onCellClick, 
  winningLines, 
  disabled,
  goldPiece,
  isClearing = false
}) => {
  const isWinningCell = (row: number, col: number): boolean => {
    return winningLines.some(line => 
      line.some(([r, c]) => r === row && c === col)
    );
  };

  const isGold = (row: number, col: number): boolean => {
    return goldPiece !== null && goldPiece[0] === row && goldPiece[1] === col;
  };

  return (
    <div className="board-container">
      <div className="tic-tac-toe-board">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`board-cell ${cell ? 'filled' : ''} ${
                isWinningCell(rowIndex, colIndex) ? 'winning' : ''
              } ${disabled ? 'disabled' : ''} ${isGold(rowIndex, colIndex) ? 'gold-mark' : ''}`}
              onClick={(e) => !disabled && onCellClick(rowIndex, colIndex, e)}
              disabled={disabled || cell !== ''}
            >
              <div className={`cell-content ${isClearing ? 'shrink-out' : ''}`}>
                {cell === 'X' && <SketchyX />}
                {cell === 'O' && <SketchyO />}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default TicTacToeBoard;