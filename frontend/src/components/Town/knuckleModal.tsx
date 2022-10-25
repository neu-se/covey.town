//file containing the floating window for the knucklebones game
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';

const WIDTH = 100;
const HEIGHT = 100;

type Cell = null | number;

//takes in prop onDismiss so that parent can hide it
export default function KnuckleModal({ onDismiss }: { onDismiss: () => void }): JSX.Element {
  const [grid, setGrid] = useState<Cell[][]>(
    Array(HEIGHT).fill(0)
    .map(() => Array(WIDTH).fill(null))
  );

  //useEffect(() => {
  //setKnucklePopup(true);
  //}, []);

  return (
    <div style={{
      position: 'absolute',
      width: '100vw',
      height: '100vh',
      top: 0,
      left: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    }}>
      <div style={{
        position: 'absolute',
        width: '90vw',
        height: '86vh',
        top: '7vh',
        left: '5vw',
        backgroundColor: 'white',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{
          width: '100%',
          height: '48px',
          borderBottom: '1px solid #ccc',
          display: 'flex',
          flexFlow: 'row nowrap',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h1>Knucklebones</h1>
          <button className='knucklePopup_closeButton' onClick={onDismiss}>X</button>
        </div>
        <div className='knucklePopup_content'>
          {grid.map((row, rowIndex) => 
            <div key={rowIndex}>
              {row.map((cell, colIndex) => 
                <Cell key={rowIndex+','+colIndex} cell={cell} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Cell({ cell }: { cell: Cell }): JSX.Element {
  return (
    <div className='knucklePopup_cell'>
      {cell}
    </div>
  );
}