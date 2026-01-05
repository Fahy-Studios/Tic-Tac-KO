import React from 'react';

type WinningLine = [number, number][];
type WinningLines = WinningLine[];

interface TicTacToeBoardProps {
  board: string[][];
  onCellClick: (row: number, col: number) => void;
  winningLines: WinningLines;
  disabled: boolean;
}

const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({ 
  board, 
  onCellClick, 
  winningLines, 
  disabled 
}) => {
  const isWinningCell = (row: number, col: number): boolean => {
    return winningLines.some(line => 
      line.some(([r, c]) => r === row && c === col)
    );
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
              } ${disabled ? 'disabled' : ''}`}
              onClick={() => !disabled && onCellClick(rowIndex, colIndex)}
              disabled={disabled || cell !== ''}
            >
              <span className={`cell-content ${cell === 'X' ? 'x-mark' : cell === 'O' ? 'o-mark' : ''}`}>
                {cell}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default TicTacToeBoard;