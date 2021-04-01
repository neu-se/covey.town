import React from 'react';
import Square from './Square';

class Board extends React.Component {
  // Create the 3 x 3 board
  createBoard(row, col) {
    const board = [];
    let cellCounter = 0;

    for (let i = 0; i < row; i +=1) {
      const columns = [];
      for (let j = 0; j < col; j +=1) {
        columns.push(this.renderSquare(cellCounter+=1));
      }
      board.push(
        <div key={i} className='board-row'>
          {columns}
        </div>,
      );
    }

    return board;
  }

  renderSquare(i) {
    const squares = this.props;
    return <Square key={i} value={squares[i]} onClick={console.log("ah")} />;
  }

  render() {
    return <div>{this.createBoard(3, 3)}</div>;
  }
}

export default Board;
