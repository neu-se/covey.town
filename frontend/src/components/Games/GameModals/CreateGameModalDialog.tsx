import React, {useEffect, useState} from 'react'
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure, useToast,
} from '@chakra-ui/react'
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import TTLDisplay from "../GameDisplays/TTLDisplay";
import HangmanDisplay from "../GameDisplays/Hangman/HangmanDisplay";
import {GameCreateRequest} from "../gamesClient/GameRequestTypes";
import useCoveyAppState from "../../../hooks/useCoveyAppState";
import TTLGame from "../gamesClient/TTLGame";
import HangmanGame from "../gamesClient/HangmanGame";
import useMaybeVideo from "../../../hooks/useMaybeVideo";

export default function CreateGameModalDialog(props: {currentPlayer: {username: string, id: string}}): JSX.Element {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [gameSelection, setGameSelection] = useState('')
  const [hangmanWord, setHangmanWord] = useState('')
  const [statement1, setStatement1] = useState('')
  const [statement2, setStatement2] = useState('')
  const [statement3, setStatement3] = useState('')
  const [lie, setLie] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [currentGameId, setCurrentGameId] = useState<string>("");
  const [currentGameObject, setCurrentGameObject] = useState<TTLGame | HangmanGame | undefined>(undefined)
  const { currentPlayer } = props
  const { currentTownID, gamesClient } = useCoveyAppState();
  const toast = useToast()
  const video = useMaybeVideo();


  const createNewGame = async (requestData : GameCreateRequest) => {
    const newGameId = await gamesClient.createGame(requestData)
      .then(response => response.gameId);
    setCurrentGameId(newGameId)
    setPlaying(true);
  }

  useEffect(() => {
    const fetchGame = async () => {
      const {games} = await gamesClient.listGames({townID: currentTownID})
      const game = games.find(g => g.id === currentGameId)
      setCurrentGameObject(game)
      console.log(currentGameId)
    }
    fetchGame();
    const timer = setInterval(async () => {
      await fetchGame()
    }, 500)
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    }
  }, [currentGameId, currentTownID, gamesClient]);

  return (
    <>
      <MenuItem data-testid='openMenuButton' onClick={() => {
        onOpen();
        video?.pauseGame()}
      }>
        <Typography variant="body1">New Game</Typography>
      </MenuItem>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          {
            !playing &&
            <ModalHeader>
              New Game
            </ModalHeader>
          }
          <ModalCloseButton onClick={async () => {
            if (currentGameObject !== undefined && currentGameObject.id !== "") {
              await gamesClient.deleteGame({townID: currentTownID, gameId: currentGameObject.id});
              setCurrentGameObject(undefined)
              setPlaying(false)
              setStatement3("")
              setStatement1("")
              setStatement2("")
              setHangmanWord("")
              setLie(0)
            }
            video?.unPauseGame();
          }} />
          <ModalBody>

          {
              !playing &&
                <>
                Select a game type to get started:
                  <br/>
                  <br/>
                  <label htmlFor="hangman">
                    <input type="radio" id="hangman" name="gameChoice" value="hangman" className="games-padded-asset"
                           checked={gameSelection === 'Hangman'}
                           onChange={() => {
                             setGameSelection("Hangman")
                             setLie(0)
                           }
                           }/>
                    Hangman
                  </label><br/>
                  <label htmlFor="ttl">
                    <input type="radio" id="ttl" name="gameChoice" value="ttl" className="games-padded-asset"
                           checked={gameSelection === 'ttl'}
                           onChange={() =>
                             setGameSelection(
                               "ttl"
                             )}/>
                    Two Truths and a Lie
                  </label><br/>
                  <br/>
                  <FormControl>
                    {
                      gameSelection === 'Hangman' &&
                      <FormLabel htmlFor="hangmanWord">
                        Choose a word to start the game:
                        <Input id="hangmanWord" placeholder="Choose a word"
                               value={hangmanWord}
                               className="games-padded-asset col-12"
                               onChange={(e) =>
                                 setHangmanWord(e.target.value.toLowerCase())}/>
                      </FormLabel>
                    }
                    {
                      gameSelection === 'ttl' &&
                      <>
                        <p className="game-instructions">Write 3 statements about yourself: two truths, and one lie!</p>
                        <FormLabel htmlFor="ttlChoices1">
                          Statement #1:
                          <input id="ttlChoices1" placeholder="Enter statement"
                                 value={statement1}
                                 className="games-padded-asset"
                                 onChange={(e) =>
                                   setStatement1(e.target.value)}/>
                        </FormLabel>
                        <br/>
                        <FormLabel htmlFor="ttlChoices2">
                          Statement #2:
                          <input id="ttlChoices2" placeholder="Enter statement"
                                 value={statement2}
                                 className="games-padded-asset"
                                 onChange={(e) =>
                                   setStatement2(e.target.value)}/>
                        </FormLabel>
                        <br/>
                        <FormLabel htmlFor="ttlChoices3">
                          Statement #3:
                          <input id="ttlChoices3" placeholder="Enter statement"
                                 value={statement3}
                                 className="games-padded-asset"
                                 onChange={(e) =>
                                   setStatement3(e.target.value)}/>
                        </FormLabel>
                        <FormLabel htmlFor="lieRadios">
                          <div className="control">
                            <h3>Which is the lie?</h3>
                            <label htmlFor="choice1" className="radio">
                              <input type="radio" id="choice1" name="choices" onClick={() => setLie(1)}/>
                              Choice 1
                            </label>
                            <br/>
                            <label htmlFor="choice2" className="radio">
                              <input type="radio" id="choice2" name="choices" onClick={() => setLie(2)}/>
                              Choice 2
                            </label>
                            <br/>
                            <label htmlFor="choice3" className="radio">
                              <input type="radio" id="choice3" name="choices" onClick={() => setLie(3)}/>
                              Choice 3
                            </label>
                          </div>
                        </FormLabel>
                      </>
                    }
                  </FormControl>
                </>
            }
            {
              playing && currentGameObject !== undefined && currentGameObject.player2ID === "" &&
                <div className="games-center-div">
                  Waiting for Player 2 to join...
                </div>
            }
            {
              playing && currentGameObject !== undefined && currentGameObject.player2ID !== "" &&
                <>
                  <div className="col-12">
                    <h1 className="games-headline">
                      {gameSelection === "ttl" ? "Two Truths and a Lie" : gameSelection}
                    </h1>
                    { /* <ModalCloseButton /> */ }
                    <hr/>
                    <p className="games-subhead">{currentGameObject.player1Username} vs. {currentGameObject.player2Username}</p>
                    <br/>
                  </div>

                  <div className="games-border games-extra-padded">
                    {gameSelection === "ttl" &&
                    <TTLDisplay currentPlayerId={currentPlayer.id} startingGame = {currentGameObject as TTLGame}/>
                    }
                    {gameSelection === "Hangman" &&
                    <HangmanDisplay currentPlayerId={currentPlayer.id} startingGame={currentGameObject as HangmanGame}/>
                    }
                  </div>
                </>
            }
            {!playing &&
            <ModalFooter>
            <Button className="games-padded-asset" colorScheme="green"
                    onClick={async () => {
                      if (gameSelection === "ttl") {
                        if ( statement1 === "" || statement2 === "" || statement3 === "" || lie === 0) {
                          toast({
                            title: 'Unable to create game',
                            description: 'Make sure all fields are filled',
                            status: 'error',
                          });
                        } else {
                          await createNewGame({
                            townID: currentTownID,
                            player1Id: currentPlayer.id,
                            player1Username: currentPlayer.username,
                            gameType: gameSelection,
                            initialGameState:
                              {choice1: statement1, choice2: statement2, choice3: statement3, correctLie: lie}
                          });
                        }
                      } else if (gameSelection === "Hangman") {
                        if (hangmanWord === "") {
                          toast({
                            title: 'Unable to create game',
                            description: 'You must enter a hangman word',
                            status: 'error',
                          });
                        } else {
                          await createNewGame({
                            townID: currentTownID,
                            player1Id: currentPlayer.id,
                            player1Username: currentPlayer.username,
                            gameType: gameSelection,
                            initialGameState:
                              {word: hangmanWord}
                          });
                        }
                      }
                    }}>
              Create Game
            </Button>
              <Button className="games-padded-asset" colorScheme="red" mr={3} onClick={onClose}>
              Cancel
              </Button>
            </ModalFooter>
            }
        </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
