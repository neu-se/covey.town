import React, {useState} from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button, useDisclosure,
} from '@chakra-ui/react'
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";

export default function CreateGameModalDialog(): JSX.Element {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [gameSelection, setGameSelection] = useState('')
  const [hangmanWord, setHangmanWord] = useState('')
  const [truth1, setTruth1] = useState('')
  const [truth2, setTruth2] = useState('')
  const [lie, setLie] = useState('')

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
          <ModalCloseButton />
          <ModalBody>
            Select a game type to get started:
            <br/>
            <br/>
            <label htmlFor="tictactoe">
              <input type="radio" id="tictactoe" name="gameChoice" value="tictactoe" className="games-padded-asset"
              checked={gameSelection === 'tictactoe'}
                     onChange={() =>
                       setGameSelection(
                         "tictactoe"
                       )}/>
              Tic Tac Toe
            </label><br/>
            <label htmlFor="hangman">
              <input type="radio" id="hangman" name="gameChoice" value="hangman" className="games-padded-asset"
                     checked={gameSelection === 'hangman'}
                     onChange={() =>
                       setGameSelection(
                         "hangman"
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
              gameSelection === 'hangman' &&
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
          </ModalBody>
          <ModalFooter>
            { /* TODO: create new game in onClick, add player1username programmatically */ }
            <Button className="games-padded-asset" colorScheme="green"
                    onClick={(o) => {
                      onClose();
                    //   <GameContainer
                    //     gameType={gameSelection}
                    //     player1Username="miranda"
                    //     player2Username=""/>
                    }
                    // TODO: How to open GameContainer modal from here??
                    }>
                        Create Game
          </Button>
            <Button className="games-padded-asset" colorScheme="red" mr={3} onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
