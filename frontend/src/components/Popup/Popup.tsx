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
  } from "@chakra-ui/react";
import React, { useEffect, useState } from 'react';

// interface Props {
//     showing : boolean;
// }

export default function Popup(): JSX.Element {
    // const { isOpen = true, onOpen, onClose } = useDisclosure()
    return (
        <VStack>
  <Container maxW="container.xl">Extra-Large Container</Container>
  <Container maxW="container.lg">Large Container</Container>
  <Container maxW="container.md">Medium Container</Container>
  <Container maxW="container.sm">Small Container</Container>
</VStack>
    )
  
  }