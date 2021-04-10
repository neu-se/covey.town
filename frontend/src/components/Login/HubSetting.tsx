import React, { useCallback, useState } from 'react';

import {
    Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useMaybeVideo from '../../hooks/useMaybeVideo';
import { CoveyTownInfo } from '../../classes/TownsServiceClient';

const TownSettings: React.FunctionComponent = () => {
  const {isOpen, onOpen, onClose} = useDisclosure()
  const video = useMaybeVideo()
  const {apiClient, currentTownID, currentTownFriendlyName, currentTownIsPubliclyListed} = useCoveyAppState();
  const [friendlyName, setFriendlyName] = useState<string>(currentTownFriendlyName);
  const [isPubliclyListed, setIsPubliclyListed] = useState<boolean>(currentTownIsPubliclyListed);
  const [roomUpdatePassword, setRoomUpdatePassword] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<CoveyTownInfo[]>();

  const updateTownListings = useCallback(() => {
    // console.log(apiClient);
    apiClient.listTowns()
      .then((towns) => {
        setCurrentPublicTowns(towns.towns
          .sort((a, b) => b.currentOccupancy - a.currentOccupancy)
        );
      })
  }, [setCurrentPublicTowns, apiClient]);

  const toast = useToast()

  const handleJoin = useCallback(async (coveyRoomID: string) => {

    toast({
        title: 'Enter private Hub',
        description: 'Please type the correct password to enter:',
      })
  }, [ toast]);

  const openSettings = useCallback(()=>{
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  const closeSettings = useCallback(()=>{
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);

  const processUpdates = async (action: string) =>{
    if(action === 'delete'){
      try{
        await apiClient.deleteTown({coveyTownID: currentTownID,
          coveyTownPassword: roomUpdatePassword});
        toast({
          title: 'Town deleted',
          status: 'success'
        })
        closeSettings();
      }catch(err){
        toast({
          title: 'Unable to delete town',
          description: err.toString(),
          status: 'error'
        });
      }
    }else {
      try {
        await apiClient.updateTown({
          coveyTownID: currentTownID,
          coveyTownPassword: roomUpdatePassword,
          friendlyName,
          isPubliclyListed
        });
        toast({
          title: 'Town updated',
          description: 'To see the updated town, please exit and re-join this town',
          status: 'success'
        })
        closeSettings();
      }catch(err){
        toast({
          title: 'Unable to update town',
          description: err.toString(),
          status: 'error'
        });
      }
    }
  };

  return <>
    <MenuItem data-testid='openMenuButton' onClick={openSettings}>
      <Typography variant="body1">Hub Settings</Typography>
    </MenuItem>
    <Modal isOpen={isOpen} onClose={closeSettings}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Edit town {currentTownFriendlyName} ({currentTownID})</ModalHeader>
        <ModalCloseButton/>

        <Heading p="4" as="h4" size="md">Select a private hub to join</Heading>
            <Box maxH="500px" overflowY="scroll">
              <Table>
                <TableCaption placement="bottom">Private Hubs</TableCaption>
                <Thead><Tr><Th>Hub Name</Th><Th>Hub ID</Th><Th>Capacity</Th></Tr></Thead>
                <Tbody>
                  {currentPublicTowns?.map((town) => (
                    <Tr key={town.coveyTownID}><Td role='cell'>{town.friendlyName}</Td><Td
                      role='cell'>{town.coveyTownID}</Td>
                      <Td role='cell'>{town.currentOccupancy}/{town.maximumOccupancy}
                        <Button onClick={() => handleJoin(town.coveyTownID)}
                                disabled={town.currentOccupancy >= town.maximumOccupancy}>Connect</Button></Td></Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            <FormControl mt={4}>
              <FormLabel htmlFor='isPubliclyListed'>Publicly Listed</FormLabel>
              <Checkbox id="isPubliclyListed" name="isPubliclyListed"  isChecked={isPubliclyListed} onChange={(e)=>setIsPubliclyListed(e.target.checked)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="updatePassword">Town Update Password</FormLabel>
              <Input data-testid="updatePassword" id="updatePassword" placeholder="Password" name="password" type="password" value={roomUpdatePassword} onChange={(e)=>setRoomUpdatePassword(e.target.value)} />
            </FormControl>

          <ModalFooter>
            <Button data-testid='deletebutton' colorScheme="red" mr={3} value="delete" name='action1' onClick={()=>processUpdates('delete')}>
              Delete
            </Button>
            <Button data-testid='updatebutton' colorScheme="blue" mr={3} value="update" name='action2' onClick={()=>processUpdates('edit')}>
              Update
            </Button>
            <Button onClick={closeSettings}>Cancel</Button>
          </ModalFooter>
      </ModalContent>
    </Modal>
  </>
}


export default TownSettings;
