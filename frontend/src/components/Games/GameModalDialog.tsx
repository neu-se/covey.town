import React from 'react'
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
import GameController from "../../../../services/roomService/src/games/GameController";
import GameContainer from "./GameContainer";

interface GameModalDialogProps {
  dialogType: string;
  gameId: string;
  gameType: string;
  player1Username: string;
}

export default function GameModalDialog({dialogType, gameId, gameType, player1Username}: GameModalDialogProps): JSX.Element {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const controller = GameController.getInstance()
  return (
    <>
      <MenuItem data-testid='openMenuButton' onClick={() => onOpen()}>
        <Typography variant="body1">Join Game</Typography>
      </MenuItem>

    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
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
        <ModalCloseButton />
        {dialogType === "unavailable" &&
        <ModalBody>
          Looks like someone else joined this game before you. This game is no longer open.
        </ModalBody>
        }
        {dialogType === "joining" &&
        <ModalBody>
          Are you sure you want to join a {gameType} game with {player1Username}?
        </ModalBody>
        }
        <ModalFooter>
          {dialogType === "joining" &&
          //  TODO: figure out how to get player2's id
          <GameContainer gameType={gameType}
                         gameId={gameId}
                         player1Username={player1Username}
                         player2Username=""/>
          }
          <Button className="games-padded-asset" colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
      </>
  )
}
