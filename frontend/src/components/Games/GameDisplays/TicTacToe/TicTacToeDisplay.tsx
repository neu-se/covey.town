import React from 'react'
import TicTacToeBox from "./TicTacToeBox";

export default function TicTacToeDisplay(): JSX.Element {
  return(
    <>
      <br/>
      <div className="games-center-div">
        <div className="row">
          <TicTacToeBox boxId="1A"/>
          <TicTacToeBox boxId="1B"/>
          <TicTacToeBox boxId="1C"/>
        </div>
        <div className="row">
          <TicTacToeBox boxId="2A"/>
          <TicTacToeBox boxId="2B"/>
          <TicTacToeBox boxId="2C"/>
        </div>
        <div className="row">
          <TicTacToeBox boxId="3A"/>
          <TicTacToeBox boxId="3B"/>
          <TicTacToeBox boxId="3C"/>
        </div>
      </div>
      <br/>
      </>
  )
}
