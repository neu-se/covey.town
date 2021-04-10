import React, {useState} from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button, useDisclosure,
} from '@chakra-ui/react'
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import GameController from "./gamesService/GameController";
import TTLDisplay from "./GameDisplays/TTLDisplay";
import TTLGame from "./gamesService/TTLGame";
import HangmanDisplay from "./GameDisplays/Hangman/HangmanDisplay";
import HangmanGame from "./gamesService/HangmanGame";

interface GameModalDialogProps {
  dialogType: string;
  gameId: string;
  gameType: string;
}

export default function JoinGameModalDialog({dialogType, gameId, gameType}: GameModalDialogProps): JSX.Element {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const controller = GameController.getInstance()
  const game = controller.findGameById(gameId)
  const [playing, setPlaying] = useState(false);
  return (
    <>
      <MenuItem data-testid='openMenuButton' onClick={() => onOpen()}>
        <Typography variant="body1">Join Game</Typography>
      </MenuItem>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          {!playing &&
          <>
            {dialogType === "unavailable" &&
            <ModalHeader>
              Uh Oh!
            </ModalHeader>
            }
            {dialogType === "joining" &&
            <ModalHeader>
              Ready to Play?
            </ModalHeader>
            }
            <ModalCloseButton/>
            {dialogType === "unavailable" &&
            <ModalBody>
              Looks like someone else joined this game before you. This game is no longer open.
            </ModalBody>
            }
            {dialogType === "joining" &&
            <ModalBody>
              Are you sure you want to join a {gameType} game with {game ? game.player1ID : "this player"}?
            </ModalBody>
            }
            {dialogType === "joining" &&
            <ModalFooter>
              <Button className="games-padded-asset" colorScheme="green"
                      onClick={() => {
                        //  TODO: get player 2's username
                        game?.playerJoin("");
                        setPlaying(true)
                      }
                      }>Join Game</Button>
              <Button className="games-padded-asset" colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>

            }
          </>
          }
          {
            playing && game &&
            <>
              <div className="col-12">
                <h1 className="games-headline">
                  {gameType === "ttl" ? "Two Truths and a Lie" : gameType}
                </h1>
                <ModalCloseButton/>
                <hr/>
                <p className="games-subhead">{game.player1ID} vs. {game.player2ID}</p>
                <br/>
              </div>

              <div className="games-border games-extra-padded">
                {/* TODO: re-add tictactoe option */}
                {/* {gameType === "TicTacToe" && */}
                {/* <TicTacToeDisplay game={game as TicTacToeGame}/> */}
                {/* } */}
                {gameType === "ttl" &&
                <TTLDisplay game={game as TTLGame}/>
                }
                {gameType === "Hangman" &&
                <HangmanDisplay game={game as HangmanGame}/>
                }
              </div>
            </>

          }
        </ModalContent>
      </Modal>
    </>
  )
}
