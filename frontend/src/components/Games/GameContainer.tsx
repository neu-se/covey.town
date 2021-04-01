import React from 'react'
import {Button, Modal, ModalCloseButton, ModalContent, ModalOverlay, useDisclosure} from "@chakra-ui/react";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import TicTacToeDisplay from "./GameDisplays/TicTacToeDisplay";
import TTLDisplay from "./GameDisplays/TTLDisplay";
import HangmanDisplay from "./GameDisplays/HangmanDisplay";

interface GameContainerProps {
  gameType: string;
  player1Username: string;
  player2Username: string;
}

export default function GameContainer({gameType, player1Username, player2Username} : GameContainerProps): JSX.Element {
  const {isOpen, onOpen, onClose} = useDisclosure();

  return(
    // TODO: delete menu item button
    <>
      <MenuItem data-testid='openMenuButton' onClick={() => onOpen()}>
        <Typography variant="body1">Game Container</Typography>
      </MenuItem>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
      <div className="col-12">
        <h1 className="games-headline">{gameType}</h1>
        <ModalCloseButton />
        <hr/>
        <p className="games-subhead">{player1Username} vs. {player2Username}</p>
        <br/>
      </div>

          <div className="games-border">
            {gameType === "TicTacToe" &&
            <TicTacToeDisplay/>
            }
            {gameType === "TTL" &&
            <TTLDisplay/>
            }
            {gameType === "Hangman" &&
            <HangmanDisplay/>
            }
            test data here
          </div>
          <br/>

      <div className="row games-center-div">
          <input className="form-control games-extra-padded"
                 size={30}
                 placeholder="Enter your response"/>
      </div>
          <div className="row games-center-div">

          <Button className="games-extra-padded" colorScheme="green">
            Submit
          </Button>
          </div>
        </ModalContent>
    </Modal>
      </>
  )
}
