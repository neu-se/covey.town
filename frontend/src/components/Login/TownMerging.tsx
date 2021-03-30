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
  const {apiClient, currentTownID, currentTownFriendlyName, currentTownIsMergeable} = useCoveyAppState();
  const [friendlyName, setFriendlyName] = useState<string>(currentTownFriendlyName);
  const [townChosen, setTownChosen] = useState<string>('');
  const [isMergeable, setIsMergeable] = useState<boolean>(currentTownIsMergeable);

  const openSettings = useCallback(()=>{
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  const closeSettings = useCallback(()=>{
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);

  const toast = useToast()

  // TODO: need to only show mergeable towns
  const updateMergeableTowns = useCallback(() => {
    apiClient.listMergeableTowns()
      .then((towns) => {
        setCurrentMergeableTowns(towns.towns.filter((town) => town.coveyTownID !== currentTownID)
          .sort((a, b) => a.currentOccupancy - b.currentOccupancy)
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
  

  const handleMerge = async () => {

  }

  const whatToSay = () => {
    let toReturn =  'this is false';
    if(isMergeable === true){
      toReturn = 'this is true';
    } else if(isMergeable === undefined) {
      toReturn = 'this is undefined'
    }
    return toReturn;
}

  return <>
    <MenuItem data-testid='openMenuButton' onClick={openSettings}>
      <Typography variant="body1">Merge with Other Towns {whatToSay()} hello</Typography>
    </MenuItem>
    <Modal isOpen={isOpen} onClose={closeSettings}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Merge {currentTownFriendlyName} ({currentTownID}) with another town?</ModalHeader>
        <ModalCloseButton/>
        {/* maybe don't need this form */}
        <form onSubmit={(ev)=>{ev.preventDefault(); handleMerge()}}>
          <ModalBody pb={6}>
            <Heading as="h4" size="md">Select a public town to merge with</Heading>
            <form>
              { currentMergeableTowns?.map((town) => (
                <div key={town.coveyTownID} className="radio">
                  <FormControl>
                    <input type="radio" value={town.coveyTownID} 
                      checked={townChosen === town.coveyTownID}
                      onChange={event => setTownChosen(event.target.value)} />
                      { town.friendlyName }   { town.currentOccupancy }/{ town.maximumOccupancy }
                  </FormControl>
                </div>
              )) }
            </form>
            <form>
            <Heading as="h4" size="md">Or enter Town ID</Heading>
            <FormControl>
              <Input name="townIDToJoin" placeholder="ID of town to join, or select from list"
                    value={townChosen}
                    onChange={event => setTownChosen(event.target.value)}/>
            </FormControl>
            </form>
          </ModalBody>

          <ModalFooter>
            <Button data-testid='submit' colorScheme="blue" mr={3} value="update" name='action2' onClick={()=>handleMerge()}>
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
