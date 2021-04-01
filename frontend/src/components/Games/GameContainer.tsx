import React from 'react'
import TicTacToeDisplay from "./GameDisplays/TicTacToeDisplay";
import TTLDisplay from "./GameDisplays/TTLDisplay";
import HangmanDisplay from "./GameDisplays/HangmanDisplay";
import {Button} from "@chakra-ui/react";

interface GameContainerProps {
  gameType: string;
  player1Username: string;
  player2Username: string;
}

export default function GameContainer({gameType, player1Username, player2Username} : GameContainerProps): JSX.Element {
  return(
    <>
      <div className="col-12">
        <h1>{gameType}</h1>
        <hr/>
        <p>{player1Username} vs. {player2Username}</p>
      </div>

      {gameType === "TicTacToe" &&
      <TicTacToeDisplay/>
      }
      {gameType === "TTL" &&
      <TTLDisplay/>
      }
      {gameType === "Hangman" &&
      <HangmanDisplay/>
      }

      <div className="row">
        <div className="col-8">
          <input className="form-control"
          placeholder="Type your response here"/>
        </div>
        <div className="col-4">
          <Button>
            Submit
          </Button>
        </div>
      </div>
    </>
  )
}
