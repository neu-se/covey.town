import React, { useCallback, useEffect, useState } from 'react';

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
  Radio,
  RadioGroup, 
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
import { CoveyTownInfo, TownJoinResponse, } from '../../classes/TownsServiceClient';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useMaybeVideo from '../../hooks/useMaybeVideo';

const TownMerging: React.FunctionComponent = () => {
  const [currentMergeableTowns, setCurrentMergeableTowns] = useState<CoveyTownInfo[]>();
  const {isOpen, onOpen, onClose} = useDisclosure()
  const video = useMaybeVideo()
  const {apiClient, currentTownID, currentTownFriendlyName, currentTownIsMergeable, players} = useCoveyAppState();
  const [mergedTownName, setMergedTownName] = useState<string>('');
  const [townChosen, setTownChosen] = useState<string>('');
  const [roomMergePassword, setRoomMergePassword] = useState<string>('');
  const [newTownOccupancy, setNewTownOccupancy] = useState<number>(0);
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [newTownIsMergeable, setNewTownIsMergeable] = useState<boolean>(true);

  const openMerging = useCallback(()=>{
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  const closeSettings = useCallback(()=>{
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);

  // const newOccupancy = useCallback(() => {
  //   setNewTownOccupancy(0) 
  //   let occ = 0;
  //   const townsToAdd = currentMergeableTowns?.filter((town) => 
  //     town.coveyTownID === currentTownID ||  town.coveyTownID === townChosen);
  //   townsToAdd?.forEach((town) => occ += town.currentOccupancy)
  //   // return occ;
  //   setNewTownOccupancy(occ) 
  // }, [townChosen]);
  

  const updateMergeableTowns = useCallback(() => {
    console.log(players.length);
    apiClient.listMergeableTowns()
      .then((towns) => {
        setCurrentMergeableTowns(towns.towns.filter((town) => town.coveyTownID !== currentTownID && town.currentOccupancy + players.length <= town.maximumOccupancy)
          .sort((a, b) => b.currentOccupancy - a.currentOccupancy)
        );
      })
  }, [setCurrentMergeableTowns, apiClient]);
  useEffect(() => {
    updateMergeableTowns();
    const timer = setInterval(updateMergeableTowns, 2000);
    return () => {
      clearInterval(timer)
    };
  }, [updateMergeableTowns]);

  const toast = useToast();
  const handleMergeRequest = async () => {
    try {
      await apiClient.mergeTowns({requestingCoveyTownID: currentTownID, 
                                  destinationCoveyTownID: townChosen, 
                                  coveyTownPassword: roomMergePassword,
                                  newTownFriendlyName: mergedTownName, 
                                  newTownIsPubliclyListed: newTownIsPublic, 
                                  newTownIsMergeable
                                });
      // toast({
      //   title: 'Towns merged',
      //   description: 'To see the updated town, please exit and re-join this town',
      //   status: 'success'
      // })
      closeSettings();
    } catch(err) {
      toast({
        title: 'Unable to merge towns',
        description: err.toString(),
        status: 'error'
      }); 
    }
  };
  

  /**
   * call playerDisconnect
   */
  // const handleJoin = useCallback(async (coveyRoomID: string) => {
  //   try {
  //     if (!userName || userName.length === 0) {
  //       toast({
  //         title: 'Unable to join town',
  //         description: 'Please select a username',
  //         status: 'error',
  //       });
  //       return;
  //     }
  //     if (!coveyRoomID || coveyRoomID.length === 0) {
  //       toast({
  //         title: 'Unable to join town',
  //         description: 'Please enter a town ID',
  //         status: 'error',
  //       });
  //       return;
  //     }
  //     const initData = await Video.setup(userName, coveyRoomID);

  //     const loggedIn = await doLogin(initData);
  //     if (loggedIn) {
  //       assert(initData.providerVideoToken);
  //       await connect(initData.providerVideoToken);
  //     }
  //   } catch (err) {
  //     toast({
  //       title: 'Unable to connect to Towns Service',
  //       description: err.toString(),
  //       status: 'error'
  //     })
  //   }
  // }, [doLogin, userName, connect, toast]);

  return <>
    <MenuItem data-testid='openMerging' onClick={openMerging} disabled={!currentTownIsMergeable}>
      <Typography variant="body1">Merge with Other Towns</Typography>
    </MenuItem>
    <Modal isOpen={isOpen} onClose={closeSettings}>
      <ModalOverlay/>
      <ModalContent style={{ maxWidth:'40rem' }}>

        <Heading p="4" as="h2" size="lg">Merge { currentTownFriendlyName } with another town?</Heading>

        <ModalCloseButton/>
        <form onSubmit={(ev)=>{ev.preventDefault(); handleMergeRequest()}}>
          <ModalBody pb={6}>
            <form>
              <FormControl>
                <FormLabel htmlFor="townIDToMergeWith">Town ID</FormLabel>
                <Input name="townIDToMergeWith" placeholder="ID of town to join, or select from list"
                      value={townChosen}
                      onChange={event => setTownChosen(event.target.value)}/>
              </FormControl>
            </form>

            <Heading as="h4" size="md" style={{ marginTop:15, marginBottom:15 }} >Select a town to merge with</Heading>
            <form>
              <Box maxH="500px" overflowY="scroll">
                <Table>
                  <Thead><Tr><Th>Town Name</Th><Th>Town ID</Th><Th>Occupancy</Th><Th>Select Town</Th></Tr></Thead>
                  <Tbody>
                    {currentMergeableTowns?.map((town) => (
                      <Tr key={town.coveyTownID}><Td role='cell'>{town.friendlyName}</Td><Td>{town.coveyTownID}</Td>
                        <Td role='cell'>{town.currentOccupancy}/{town.maximumOccupancy}</Td>
                        <Td><Button onClick={() => setTownChosen(town.coveyTownID)}>Select</Button></Td></Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </form>
            <Box>
              <FormControl isRequired style={{marginTop:15}}>
                <FormLabel htmlFor="mergedTownName">Merged Town Name</FormLabel>
                <Input data-testid="mergedTownName" id="mergedTownName" placeholder="Merged Town Name" value={mergedTownName} onChange={(e)=>setMergedTownName(e.target.value)} />
              </FormControl>
            </Box>
            <FormControl>
              <FormLabel htmlFor="isPublic">Publicly Listed</FormLabel>
              <Checkbox id="isPublic" name="isPublic" isChecked={newTownIsPublic}
                        onChange={(e) => {
                          setNewTownIsPublic(e.target.checked)
                        }}/>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="isMergeable">Mergeable?</FormLabel>
              <Checkbox id="isMergeable" name="isMergeable" isChecked={newTownIsMergeable}
                        onChange={(e) => {
                          setNewTownIsMergeable(e.target.checked)
                        }}/>
            </FormControl>
            {/* <Heading>New occupancy: {newTownOccupancy}</Heading> */}
            <FormControl isRequired style={{marginTop:15}}>
              <FormLabel htmlFor="roomMergePassword">Town Update Password</FormLabel>
              <Input data-testid="roomMergePassword" id="roomMergePassword" placeholder="Password" name="password" type="password" value={roomMergePassword} onChange={(e)=>setRoomMergePassword(e.target.value)} />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button data-testid='submit' colorScheme="blue" mr={3} value="update" name='action2' onClick={()=>handleMergeRequest()}>
              Submit
            </Button>
            <Button onClick={closeSettings}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  </>
}


export default TownMerging;
