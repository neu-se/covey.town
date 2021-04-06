import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    CloseButton,
    VStack,
    Container,
    Image,
    Box,
    extendTheme,
  } from "@chakra-ui/react";
import React, { useEffect, useState } from 'react';
import useNearbyPlayers from '../../hooks/useNearbyPlayers';
import GameBoard from '../world/GameBoard';
import * as board from "./checker-board.png";

// interface Props {
//     showing : boolean;
// }


export default function Popup(): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { nearbyPlayers } = useNearbyPlayers();
  const hasNearbyPlayer = nearbyPlayers.length > 0;

  // 2. Define the new text styles
  const theme = extendTheme({
    textStyles: {
      h1: {
        // you can also use responsive styles
        fontSize: ["72px", "98px"],
        fontWeight: "bold",
        lineHeight: "110%",
        letterSpacing: "-2%",
      },
      h2: {
        fontSize: ["36px", "48px"],
        fontWeight: "semibold",
        lineHeight: "110%",
        letterSpacing: "-1%",
      },
    },
  })

  return (
    <>
      <Button top="60" left="80" style={{ display: hasNearbyPlayer ? "block" : "none" }} height="148px" width="300px" onClick={onOpen}>Play Checkers</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader ml={150} textStyle="h1">Checkers</ModalHeader>
          <ModalCloseButton />
          <ModalFooter>
            <Button colorScheme="blue" mr={100} onClick={onClose}>
              Close
            </Button>
            <Button mr={40} variant="ghost">Play</Button>
          </ModalFooter>
            <Image ml={75} mb={20} boxSize="300px" src="./checker-board.png" alt="Checkerboard" />
        </ModalContent>
      </Modal>
    </>
  )
  
  }