import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button, useDisclosure,
} from "@chakra-ui/react"

export default function GameContainer({dialogType, gameType, player1Username}): JSX.Element {
  const {isOpen, onOpen, onClose} = useDisclosure()
  return (
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
          Are you sure you'd like to join a {gameType} game with {player1Username}?
        </ModalBody>
        }
        <ModalFooter>
          {dialogType === "joining" &&
          //  TODO: add onClick to this button that joins Player2 to the game and starts the game
          <Button colorScheme="green">Join Game</Button>
          }
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
