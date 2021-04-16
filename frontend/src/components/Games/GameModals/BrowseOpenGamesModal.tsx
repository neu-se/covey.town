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
import {GameList} from "../gamesClient/GameList";
import JoinGameModalDialog from "./JoinGameModalDialog";
import useCoveyAppState from "../../../hooks/useCoveyAppState";
import useMaybeVideo from "../../../hooks/useMaybeVideo";


export default function BrowseOpenGamesModal(props: {currentPlayer: {username: string, id: string}}): JSX.Element {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [gamesList, setGamesList] = useState<GameList>();
  const { currentTownID, gamesClient } = useCoveyAppState();
  const video = useMaybeVideo()

  useEffect(() => {
    const fetchAllGames = async () => {
      const { games } = await gamesClient.listGames({townID: currentTownID})
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
  },[gamesClient])

  return (
    <>
      <MenuItem data-testid='openMenuButton' onClick={() => {
        onOpen();
        video?.pauseGame()}
      }>
        <Typography variant="body1">Browse Open Games</Typography>
      </MenuItem>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Browse Open Games
          </ModalHeader>
          <ModalCloseButton onClick={() => {
            onClose();
            video?.unPauseGame();
          }
          }/>
          <ModalBody>
            <UnorderedList>
              {gamesList?.map(game =>
                <ListItem key={game.id}>Play {game.id.includes("ttl") ? "Two Truths and a Lie" : "Hangman"} with {game.player1Username}
                  <div className="float-right">
                    <JoinGameModalDialog currentPlayer={props.currentPlayer}
                                         dialogType={game.player2ID === '' ? 'joining' : 'unavailable'}
                                         gameId={game.id} gameType={game.id.includes("ttl") ? "ttl" : "Hangman"}
                                         player1={game.player1Username}/>
                  </div>
                </ListItem>
              )}
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
