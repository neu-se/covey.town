import React, { useCallback, useState } from 'react';
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
    Tbody,
  } from '@chakra-ui/react';
import MenuItem from '@material-ui/core/MenuItem';
import { Typography } from '@material-ui/core';
import {ListNeighborsResponse} from '../../classes/TownsServiceClient';
import useCoveyAppState from '../../hooks/useCoveyAppState';



export default function Profile (props : {userName : string, id : string, handleJoin : (coveyRoomID : string) => Promise<void> }) : JSX.Element {
    const {userName, id, handleJoin} = props;
    const [neighbors, setNeighbors] = useState<ListNeighborsResponse>({users: []})
    const {isOpen, onOpen, onClose} = useDisclosure()
    const { apiClient } = useCoveyAppState();
    
    const openProfile = useCallback(() => {
        onOpen();
        apiClient.listNeighbors(id)
            .then((users) => {
                setNeighbors(users);
            })
    }, [onOpen, apiClient, id]);

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
                                <Tbody>
                                    {
                                        neighbors.users.map((user) => (
                                            <Tr key={user._id}><Td>{user.username}</Td><Td>{user.isOnline}</Td>
                                            <Td><Button onClick={() => handleJoin(user._id)}>Join</Button></Td></Tr>
                                        ))
                                    }
                                </Tbody>
                            </Table>
                        </FormControl>
                    </ModalBody>
                </form>
            </ModalContent>
        </Modal>
        </>
    )
}
