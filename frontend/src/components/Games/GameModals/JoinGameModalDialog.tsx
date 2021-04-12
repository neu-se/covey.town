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
import GameController from "../gamesService/GameController";
import TTLDisplay from "../GameDisplays/TTLDisplay";
import TTLGame from "../gamesService/TTLGame";
import HangmanDisplay from "../GameDisplays/Hangman/HangmanDisplay";
import HangmanGame from "../gamesService/HangmanGame";

interface GameModalDialogProps {
  currentPlayer: {username: string, id: string},
  dialogType: string;
  gameId: string;
  gameType: string;
}

export default function JoinGameModalDialog({currentPlayer, dialogType, gameId, gameType}: GameModalDialogProps): JSX.Element {
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
              Are you sure you want to join a {gameType} game with {game ? game.player1Username : "this player"}?
            </ModalBody>
            }
            {dialogType === "joining" &&
            <ModalFooter>
              <Button className="games-padded-asset" colorScheme="green"
                      onClick={() => {
                        game?.playerJoin(currentPlayer.id, currentPlayer.username);
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
            playing &&
            //  TODO: Uncomment this when actually connected to game!
            // game &&
            <>
              <div className="col-12">
                <h1 className="games-headline">
                  {gameType === "ttl" ? "Two Truths and a Lie" : gameType}
                </h1>
                <ModalCloseButton/>
                <hr/>
                {/* TODO: remove null check when above like is uncommented */}
                <p className="games-subhead">{game ? game.player1Username : "player1"} vs. {game ? game.player2Username : "player2"}</p>
                <br/>
              </div>

              <div className="games-border games-extra-padded">
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
