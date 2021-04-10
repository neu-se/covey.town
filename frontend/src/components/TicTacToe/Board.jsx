import React, { useState } from "react";
import ReactDOM from "react-dom";

function Square({ value, onClick }) {

  return (
    <button type="button" className="square" onClick={onClick}>
      {value}
    </button>
  );
}

Square.propTypes = {
  value: String,
  onClick: null
}

Square.defaultProps = {
  value: null, 
  onClick: () => {}
}

function Restart({onClick}) {

  return (
    <button type="button" className="restart" onClick={onClick}>
      Play again
    </button>
  );
}

Restart.propTypes = {
  onClick: null
}

Restart.defaultProps = {
  onClick: () => {}
}

function Game() {
  const [ squares, setSquares ] = useState(Array(9).fill(null));
  const [ isXNext, setIsXNext ] = useState(true);
  const nextSymbol = isXNext ? "X" : "O";
  const winner = null;

  function getStatus() {
    return "return status here"
    // change this
    // if (nextSymbol) {
    //   return "Winner: " + "add winner here";
    // } else if (isBoardFull(squares)) {
    //   return "Draw!";
    // } else { 
    //   return `Next player: ${nextSymbol}`;
    // }
  }

  sendMove = async () => {
    return fetch("/api/movies", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ weather: this.props.weather }),
    })
      .then((raw) => {
        return raw.json();
      })
      .catch((err) => {
        console.log(err);
      });
  };


  function renderSquare(i) {
    return (
      <Square
        value={squares[i]}
        onClick={() => {
          if (squares[i] != null || winner != null) {
            return;
          }
          const nextSquares = squares.slice();
          nextSquares[i] = nextSymbol;
          setSquares(nextSquares);

          setIsXNext(!isXNext); // toggle turns
        }}
      />
    );
  }

  function renderRestartButton() {
    return (
      <Restart
        onClick={() => {
          setSquares(Array(9).fill(null));
          setIsXNext(true);
        }}
      />
    );
  }

  return (
    <div className="container">
      <div className="game">
        <div className="game-board">
          <div className="board-row">
            {renderSquare(0)}
            {renderSquare(1)}
            {renderSquare(2)}
          </div>
          <div className="board-row">
            {renderSquare(3)}
            {renderSquare(4)}
            {renderSquare(5)}
          </div>
          <div className="board-row">
            {renderSquare(6)}
            {renderSquare(7)}
            {renderSquare(8)}
          </div>
        </div>
        <div className="game-info">{getStatus()}</div>
        <div className="restart-button">{renderRestartButton()}</div>
      </div>
    </div>
  );
}

export default Game;