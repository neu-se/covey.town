import React from 'react'
import { Modal, ModalCloseButton, ModalContent, ModalOverlay, useDisclosure} from "@chakra-ui/react";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import TicTacToeDisplay from "./GameDisplays/TicTacToe/TicTacToeDisplay";
import TTLDisplay from "./GameDisplays/TTLDisplay";
import HangmanDisplay from "./GameDisplays/Hangman/HangmanDisplay";
import GameController from "../../../../services/roomService/src/games/GameController";
import TTLGame from "../../../../services/roomService/src/games/TTLGame";
import TicTacToeGame from "../../../../services/roomService/src/games/TicTacToeGame";
import HangmanGame from "../../../../services/roomService/src/games/HangmanGame";

interface GameContainerProps {
  gameType: string;
  gameId: string;
  player1Username: string;
  player2Username: string
}

export default function GameContainer({gameType, gameId, player1Username, player2Username} : GameContainerProps): JSX.Element {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const controller = GameController.getInstance()
  const game = controller.findGameById(gameId)

  return(
    // TODO: delete menu item button
    <>
      <Button onClick={onOpen} className="games-padded-asset"
              colorScheme="green">Play</Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
      <div className="col-12">
        <h1 className="games-headline">
          {gameType === "TTL" ? "Two Truths and a Lie" : gameType}
        </h1>
        <ModalCloseButton />
        <hr/>
        <p className="games-subhead">{player1Username} vs. {player2Username}</p>
        <br/>
      </div>

          <div className="games-border games-extra-padded">
            {gameType === "TicTacToe" &&
            <TicTacToeDisplay game={game as TicTacToeGame}/>
            }
            {gameType === "TTL" &&
            //  TODO: Fill game data programmatically
            <TTLDisplay game = {game as TTLGame}/>
            }
            {gameType === "Hangman" &&
            <HangmanDisplay game={game as HangmanGame}/>
            }
          </div>
          <br/>
        </ModalContent>
    </Modal>
      </>
  )
}
