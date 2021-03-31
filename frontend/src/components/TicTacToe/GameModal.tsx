import React, { useCallback, useState } from 'react';

import {
  Button,
  Checkbox,
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
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import useMaybeVideo from '../../hooks/useMaybeVideo';


const GameModal: React.FunctionComponent = () => {
  const {isOpen, onOpen, onClose} = useDisclosure()
  const video = useMaybeVideo()

  const openGame = useCallback(()=>{
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  if (video) {
    video.openGameModal = openGame;
  }

  const closeGame = useCallback(()=>{
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);


  return <>
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>TIC TAC TOE</ModalHeader>
        <Button onClick={closeGame}>Close</Button>
          <ModalBody pb={6}/>
      </ModalContent>
    </Modal>
  </>
}


export default GameModal;
