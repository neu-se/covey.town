import React, { useCallback } from 'react';
import {
    Button,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Table,
    Thead,
    Th,
    Td,
    Tr,
    useDisclosure,
  } from '@chakra-ui/react';
import MenuItem from '@material-ui/core/MenuItem';
import { Typography } from '@material-ui/core';



export default function Profile (props : {userName : string}) : JSX.Element {
    const {userName} = props;
    const {isOpen, onOpen, onClose} = useDisclosure()
    const openProfile = useCallback(() => {
        onOpen();
    }, [onOpen]);

    const closeProfile = useCallback(() => {
        onClose();
    }, [onClose])

    return (
        <>
        <Button mt='5' colorScheme='cyan' data-testid='openMenuButton' onClick={openProfile}>
            <Typography variant="body1">Profile</Typography>
        </Button>
        <Modal isOpen={isOpen} onClose={closeProfile}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Profile</ModalHeader>
                <ModalCloseButton/>
                <form>
                    <ModalBody pb={6}>
                        <FormControl>
                            <FormLabel htmlFor='username'>Username</FormLabel>
                            <Input value={userName} isDisabled/>
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor='password'>Password</FormLabel>
                            <Input placeholder='Password' isDisabled/>
                        </FormControl>
                        <Heading p="4" as="h4" size="md">Neighbors</Heading>
                        <FormControl>
                            <Table>
                                <Thead><Tr><Th>Neighbor</Th><Th>Status</Th><Th>Join Room</Th></Tr></Thead>
                            </Table>
                        </FormControl>
                    </ModalBody>
                </form>
            </ModalContent>
        </Modal>
        </>
    )
}
