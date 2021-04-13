import React, {useEffect, useState} from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  UnorderedList,
  useDisclosure,
} from '@chakra-ui/react'
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import { ListItem } from '@material-ui/core';
import {GameList} from "../gamesClient/Types";
import {findAllGames} from "../gamesService/GameRequestHandler";


export default function BrowseOpenGamesModal(): JSX.Element {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [gamesList, setGamesList] = useState<GameList>();

  useEffect(() => {
    const fetchAllGames = async () => {
      console.info("Fetching games")
      const games = (await findAllGames()).response?.games
      setGamesList(games)
    }
    fetchAllGames()
    const timer = setInterval(async () => {
      await fetchAllGames()
    }, 5000)

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    }
  },[])

  console.log('Games:',gamesList)

  return (
    <>
      <MenuItem data-testid='openMenuButton' onClick={() => onOpen()}>
        <Typography variant="body1">Browse Open Games</Typography>
      </MenuItem>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Browse Open Games
          </ModalHeader>
          <ModalCloseButton onClick={async () => {
            onClose();
          }
          }/>
          <ModalBody>
            <UnorderedList>
              {gamesList?.map(game => <ListItem key={game.gameID}>Hello</ListItem>)}
            </UnorderedList>
          </ModalBody>
          <ModalFooter>
            <Button className="games-padded-asset" colorScheme="red" mr={3} onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
