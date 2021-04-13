import React, {useState} from 'react'
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
import TTLGame from "../gamesService/TTLGame";
import HangmanGame from "../gamesService/HangmanGame";
import TTLDisplay from "../GameDisplays/TTLDisplay";
import HangmanDisplay from "../GameDisplays/Hangman/HangmanDisplay";
import {GameCreateRequest} from "../gamesClient/Types";
import {createGame, deleteGame, findGameById} from "../../../../../services/roomService/src/requestHandlers/GameRequestHandler";

export default function CreateGameModalDialog(props: {currentPlayer: {username: string, id: string}}): JSX.Element {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [gameSelection, setGameSelection] = useState('')
  const [hangmanWord, setHangmanWord] = useState('')
  const [truth1, setTruth1] = useState('')
  const [truth2, setTruth2] = useState('')
  const [lie, setLie] = useState('')
  const [playing, setPlaying] = useState(false)
  const [game, setGame] = useState<TTLGame | HangmanGame | null>(null)
  const { currentPlayer } = props
  const toast = useToast()

  const getNewGame = async (requestData : GameCreateRequest) => {
    const newGameID = await createGame(requestData)
      .then(response => response.response?.gameID);
    if (newGameID !== undefined) {
      return findGameById(newGameID)
    }
    return undefined
  }

  return (
    <>
      <MenuItem data-testid='openMenuButton' onClick={() => onOpen()}>
        <Typography variant="body1">New Game</Typography>
      </MenuItem>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            New Game
          </ModalHeader>
          <ModalCloseButton onClick={async () => {
            if (game) {
              await deleteGame({gameID: game.id});
              setGame(null)
              setPlaying(false)
              setLie("")
              setTruth1("")
              setTruth2("")
              setHangmanWord("")
            }
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
                           onChange={() =>
                             setGameSelection(
                               "Hangman"
                             )}/>
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
                                 setHangmanWord(e.target.value)}/>
                      </FormLabel>
                    }
                    {
                      gameSelection === 'ttl' &&
                      <>
                        <FormLabel htmlFor="ttlChoices1">
                          Truth #1:
                          <Input id="ttlChoices1" placeholder="Enter something true about yourself"
                                 value={truth1}
                                 className="games-padded-asset"
                                 onChange={(e) =>
                                   setTruth1(e.target.value)}/>
                        </FormLabel>
                        <br/>
                        <FormLabel htmlFor="ttlChoices2">
                          Truth #2:
                          <Input id="ttlChoices2" placeholder="Enter something true about yourself"
                                 value={truth2}
                                 className="games-padded-asset"
                                 onChange={(e) =>
                                   setTruth2(e.target.value)}/>
                        </FormLabel>
                        <br/>
                        <FormLabel htmlFor="ttlChoices3">
                          Lie:
                          <Input id="ttlChoices3" placeholder="Enter a lie about yourself"
                                 value={lie}
                                 className="games-padded-asset"
                                 onChange={(e) =>
                                   setLie(e.target.value)}/>
                        </FormLabel>
                      </>
                    }
                  </FormControl>
                </>
            }
            {
              playing && game && game.player2ID === "" &&
                <div className="games-center-div">
                  Waiting for Player 2 to join...
                </div>
            }
            {
              playing && game && game.player2ID !== "" &&
                <>
                  <div className="col-12">
                    <h1 className="games-headline">
                      {gameSelection === "ttl" ? "Two Truths and a Lie" : gameSelection}
                    </h1>
                    <ModalCloseButton />
                    <hr/>
                    <p className="games-subhead">{game.player1Username} vs. {game.player2Username}</p>
                    <br/>
                  </div>

                  <div className="games-border games-extra-padded">
                    {gameSelection === "ttl" &&
                    <TTLDisplay game = {game as TTLGame}/>
                    }
                    {gameSelection === "Hangman" &&
                    <HangmanDisplay game={game as HangmanGame}/>
                    }
                  </div>
                </>

            }
          </ModalBody>
            {!playing &&
            <ModalFooter>
            <Button className="games-padded-asset" colorScheme="green"
                    onClick={async () => {
                      // TODO: get correct player1 usernames and add tictactoe option
                      if (gameSelection === "ttl") {
                        const newGame = await getNewGame({
                          player1Id: currentPlayer.id, player1Username: currentPlayer.username, gameType: gameSelection, initialGameState:
                            {choice1: truth1, choice2: truth2, choice3: lie, correctLie: 3}
                        });
                        if (newGame !== undefined) {
                          setGame(newGame);
                        }
                        else {
                          toast({
                            title: 'Unable to create game',
                            description: 'Something went wrong, unable to create game',
                            status: 'error',
                          });
                        }
                      } else if (gameSelection === "Hangman") {
                        const newGame = await getNewGame({
                          player1Id: currentPlayer.id, player1Username: currentPlayer.username, gameType: gameSelection, initialGameState:
                            {word: hangmanWord}
                        });
                        if (newGame !== undefined) {
                          setGame(newGame);
                        }
                        else {
                          toast({
                            title: 'Unable to create game',
                            description: 'Something went wrong, unable to create game',
                            status: 'error',
                          });
                        }
                      }
                      setPlaying(true);
                    }}>
              Create Game
            </Button>
              <Button className="games-padded-asset" colorScheme="red" mr={3} onClick={onClose}>
              Cancel
              </Button>
            </ModalFooter>

            }
        </ModalContent>
      </Modal>
    </>
  )
}
