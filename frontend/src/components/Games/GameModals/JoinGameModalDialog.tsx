import React, {useState} from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button, useDisclosure, useToast,
} from '@chakra-ui/react'
import Typography from "@material-ui/core/Typography";
import TTLDisplay from "../GameDisplays/TTLDisplay";
import HangmanDisplay from "../GameDisplays/Hangman/HangmanDisplay";
import useCoveyAppState from "../../../hooks/useCoveyAppState";
import HangmanGame from "../gamesClient/HangmanGame";
import TTLGame from "../gamesClient/TTLGame";
import useMaybeVideo from "../../../hooks/useMaybeVideo";

interface GameModalDialogProps {
  currentPlayer: {username: string, id: string},
  dialogType: string;
  gameId: string;
  gameType: string;
  player1: string;
}

export default function JoinGameModalDialog({currentPlayer, dialogType, gameId, gameType, player1}: GameModalDialogProps): JSX.Element {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const { currentTownID, gamesClient } = useCoveyAppState();
  const [currentGameObject, setCurrentGameObject] = useState<TTLGame | HangmanGame | undefined>(undefined)
  const [playing, setPlaying] = useState(false);
  const video = useMaybeVideo();


  const getCurrentGame = async () => {
    setCurrentGameObject(await gamesClient.listGames({townID: currentTownID})
      .then(response => response.games.find(g => g.id === gameId)));
    setPlaying(true);
  }



  return (
    <>
      <Button data-testid='openMenuButton' className="games-padded-asset" colorScheme="green"
              onClick={() => {
                onOpen();
                video?.pauseGame()}
              }>
        <Typography variant="body1">Join Game</Typography>
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton onClick={async () => {
            if (currentGameObject !== undefined && currentGameObject.id !== "") {
              await gamesClient.deleteGame({townID: currentTownID, gameId: currentGameObject.id});
              setCurrentGameObject(undefined)
              setPlaying(false)
            }
            video?.unPauseGame();
          }} />
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

            {dialogType === "unavailable" &&
            <ModalBody>
              Looks like someone else joined this game before you. This game is no longer open.
            </ModalBody>
            }
            {dialogType === "joining" &&
            <ModalBody>
              Are you sure you want to join a {gameType === "ttl" ? "Two Truths and a Lie" : gameType} game with {player1}?
            </ModalBody>
            }
            {dialogType === "joining" &&
            <ModalFooter>
              <Button className="games-padded-asset" colorScheme="green"
                      onClick={async () => {
                        await gamesClient.updateGame({
                          townID: currentTownID,
                            gameId,
                            player2Id: currentPlayer.id,
                            player2Username: currentPlayer.username
                          }
                        );
                        await getCurrentGame();
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
            playing && currentGameObject !== undefined &&
            <>
              <div className="col-12">
                <h1 className="games-headline">
                  {gameType === "ttl" ? "Two Truths and a Lie" : gameType}
                </h1>
                <hr/>
                <p className="games-subhead">{currentGameObject.player1Username} vs. {currentGameObject.player2Username}</p>
                <br/>
              </div>

              <div className="games-border games-extra-padded">
                {gameType === "ttl" &&
                <TTLDisplay currentPlayerId={currentPlayer.id} startingGame={currentGameObject as TTLGame}/>
                }
                {gameType === "Hangman" &&
                <HangmanDisplay currentPlayerId={currentPlayer.id} startingGame={currentGameObject as HangmanGame}/>
                }
              </div>
            </>

          }
        </ModalContent>
      </Modal>
    </>
  )
}
