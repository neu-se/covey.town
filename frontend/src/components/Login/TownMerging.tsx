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
  // const {isOpenSecond, onOpen, onClose} = useDisclosure()

  const video = useMaybeVideo()
  const {apiClient, currentTownID, currentTownFriendlyName, currentTownIsMergeable} = useCoveyAppState();
  const [friendlyName, setFriendlyName] = useState<string>(currentTownFriendlyName);
  const [townChosen, setTownChosen] = useState<string>('');
  const [userResponse, setUserResponse] = useState<boolean>(false);
  const [myTime, setMyTime] = useState<number>(75);
  const [roomUpdatePassword, setRoomUpdatePassword] = useState<string>('');


  const openMerging = useCallback(()=>{
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  const closeSettings = useCallback(()=>{
    onClose();
    video?.unPauseGame();
    // isOpenSecond = true;
  }, [onClose, video]);

  const toast = useToast()

  const updateMergeableTowns = useCallback(() => {
    apiClient.listMergeableTowns()
      .then((towns) => {
        setCurrentMergeableTowns(towns.towns.filter((town) => town.coveyTownID !== currentTownID)
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

  // TODO: this is messy lol pls fix
  // const selectTownToMergeWithHeading = useCallback(() => {
  //   if (currentMergeableTowns !== undefined ? currentMergeableTowns.length > 0 : false) {
  //     return <><Heading as="h4" size="md">Select a town to merge with</Heading></>
  //   }
  //   return <></>
  // }, [currentMergeableTowns]);

  // const selectTownToMergeWithHeading((currentMergeableTownsVar: CoveyTownInfo[]): JSX.Element => {
  //   if (currentMergeableTownsVar.length >0) {
  //     return <><Heading as="h4" size="md">Select a town to merge with</Heading></>
  //   }
  //   return <></>
  // } ); 

  const handleMergeRequest = async () => {
    // do last check on the numbers between the rwo rooms and then shut down the two rooms 
    closeSettings();
  //   return <>
  //    <Modal isOpen={isOpen} onClose={closeSettings}>
  //     <ModalOverlay/>
  //     <ModalContent class="max-width: 30rem">
  //       <Heading p="4" as="h2" size="lg">Merge { currentTownFriendlyName } ({currentTownID}) with another town?</Heading>

  //       {/* <ModalHeader>Merge {currentTownFriendlyName} ({currentTownID}) with another town?</ModalHeader> */}
  //       <ModalCloseButton/>
  //       {/* maybe don't need this form */}
  //       <form onSubmit={(ev)=>{ev.preventDefault(); handleMergeRequest()}}>
  //         <ModalBody pb={6}>
  //           <Heading as="h4" size="md">Hello!!</Heading>
  //           <form>
  //             { currentMergeableTowns?.map((town) => (
  //               <div key={town.coveyTownID} className="radio">
  //                 <FormControl>
  //                   <input type="radio" value={town.coveyTownID} 
  //                     checked={townChosen === town.coveyTownID}
  //                     onChange={event => setTownChosen(event.target.value)} />
  //                     { town.friendlyName }   { town.currentOccupancy }/{ town.maximumOccupancy }
  //                 </FormControl>
  //               </div>
  //             )) }
  //           </form>
  //           <form>
  //           <Heading as="h4" size="md">Or enter Town ID</Heading>
  //           <FormControl>
  //             <Input name="townIDToJoin" placeholder="ID of town to join, or select from list"
  //                   value={townChosen}
  //                   onChange={event => setTownChosen(event.target.value)}/>
  //           </FormControl>
  //           </form>
  //         </ModalBody>

  //         <ModalFooter>
  //           <Button data-testid='submit' colorScheme="blue" mr={3} value="update" name='action2' onClick={()=>handleMergeRequest()}>
  //             Submit
  //           </Button>
  //           <Button onClick={closeSettings}>Cancel</Button>
  //         </ModalFooter>
  //       </form>
  //     </ModalContent>
  //   </Modal>
  // </>
  }

  return <>
    <MenuItem data-testid='openMerging' onClick={openMerging} disabled={!currentTownIsMergeable}>
      <Typography variant="body1">Merge with Other Towns</Typography>
    </MenuItem>
    <Modal isOpen={isOpen} onClose={closeSettings}>
      <ModalOverlay/>
      <ModalContent style={{ maxWidth:'40rem' }}>

        <Heading p="4" as="h2" size="lg">Merge { currentTownFriendlyName } with another town?</Heading>

        {/* <ModalHeader>Merge {currentTownFriendlyName} with another town?</ModalHeader> */}
        <ModalCloseButton/>
        <form onSubmit={(ev)=>{ev.preventDefault(); handleMergeRequest()}}>
          <ModalBody pb={6}>
            {/* <Heading as="h4" size="md">Select a public town to merge with</Heading> */}
            <form>
              <FormControl>
                <FormLabel htmlFor="townIDToMergeWith">Town ID</FormLabel>
                <Input name="townIDToMergeWith" placeholder="ID of town to join, or select from list"
                      value={townChosen}
                      onChange={event => setTownChosen(event.target.value)}/>
              </FormControl>
            </form>
            {/* {selectTownToMergeWithHeading} */}

            {/* goal is to only show this if there are towns to pick from */}
            {/* maybe deal with a table instead of radio buttons?? */}
            <Heading as="h4" size="md" style={{ marginTop:15, marginBottom:15 }} >Select a town to merge with</Heading>
            <form>
              {/* { currentMergeableTowns?.map((town) => (
                <div key={town.coveyTownID} className="radio">
                  <FormControl>
                    <input type="radio" value={town.coveyTownID} 
                      checked={townChosen === town.coveyTownID}
                      onChange={event => setTownChosen(event.target.value)} />
                      { town.friendlyName }   { town.currentOccupancy }/{ town.maximumOccupancy }
                  </FormControl>
                </div>
              )) } */}
              <Box maxH="500px" overflowY="scroll">
                <Table>
                  {/* <TableCaption placement="bottom">Publicly Listed Towns</TableCaption> */}
                  <Thead><Tr><Th>Room Name</Th><Th>Room ID</Th><Th>Activity</Th><Th>Select Town</Th></Tr></Thead>
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
            <FormControl isRequired style={{marginTop:15}}>
              <FormLabel htmlFor="updatePassword">Town Update Password</FormLabel>
              <Input data-testid="updatePassword" id="updatePassword" placeholder="Password" name="password" type="password" value={roomUpdatePassword} onChange={(e)=>setRoomUpdatePassword(e.target.value)} />
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
    {/* <Modal isOpen={isOpen} onClose={closeSettings}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Vote to merge with another town</ModalHeader>
        <ModalCloseButton/>
        <form onSubmit={(ev)=>{ev.preventDefault(); handleMergeRequest()}}>
          <ModalBody pb={6}>
            <Heading as="h4" size="md">Choose yes to merge or no to not merge</Heading>
            <form>
                <div key='Yes' className="radio">
                  <FormControl>
                    <input type="radio" value= "Yes"
                      checked={userResponse === true}
                      onChange={event => setUserResponse(true)} /> Yes
                  </FormControl> 
                </div>
                <div key='No' className="radio">
                  <FormControl>
                  <input type="radio" value= "No"
                      checked={userResponse === false}
                      onChange={event => setUserResponse(false)} /> No
                  </FormControl>
                </div>
            </form>

            <div>
                {myTime} 
            </div>
           
          </ModalBody>

          <ModalFooter>
            <Button data-testid='submit' colorScheme="blue" mr={3} value="update" name='action2' onClick={()=>handleMergeRequest()}>
              Submit
            </Button>
            <Button onClick={closeSettings}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal> */}
  </>
}


export default TownMerging;
