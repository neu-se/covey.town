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

export default function CreateGameModalDialog(): JSX.Element {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [gameSelection, setGameSelection] = useState('')

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
              <input type="radio" id="tictactoe" name="gameChoice" value="tictactoe"
              checked={gameSelection === 'tictactoe'}
                     onChange={() =>
                       setGameSelection(
                         "tictactoe"
                       )}/>
              Tic Tac Toe
            </label><br/>
            <label htmlFor="hangman">
              <input type="radio" id="hangman" name="gameChoice" value="hangman"
                     checked={gameSelection === 'hangman'}
                     onChange={() =>
                       setGameSelection(
                         "hangman"
                       )}/>
              Hangman
            </label><br/>
            <label htmlFor="ttl">
              <input type="radio" id="ttl" name="gameChoice" value="ttl"
                     checked={gameSelection === 'ttl'}
                     onChange={() =>
                       setGameSelection(
                         "ttl"
                       )}/>
              Two Truths and a Lie
            </label><br/>
          </ModalBody>
          <ModalFooter>
            {gameSelection}
            { /* TODO: add onClick to this button that joins Player2 to the game and starts the game */ }
            <Button className="games-padded-asset" colorScheme="green">Create Game</Button>
            <Button className="games-padded-asset" colorScheme="red" mr={3} onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
