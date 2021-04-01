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

const TownVoting: React.FunctionComponent = () => {
  const [currentMergeableTowns, setCurrentMergeableTowns] = useState<CoveyTownInfo[]>();

  const {isOpen, onOpen, onClose} = useDisclosure()
  const video = useMaybeVideo()
  const {apiClient, currentTownID, currentTownFriendlyName, currentTownIsMergeable} = useCoveyAppState();
  const [friendlyName, setFriendlyName] = useState<string>(currentTownFriendlyName);
  const [townChosen, setTownChosen] = useState<string>('');
  const [userResponse, setUserResponse] = useState<boolean>(false);
  const [myTime, setMyTime] = useState<number>(75);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openSettings = useCallback(()=>{
    onOpen();
    video?.pauseGame();
    setIsModalOpen(true);
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

  useEffect(() => {
    const timer2 = setInterval(() => {setMyTime(myTime - 1)}, 1000);
    return () => {
        clearInterval(timer2)
    };
  }, [isModalOpen, myTime]);
  

  const handleMergeRequest = async () => {
    // do last check on the numbers between the rwo rooms and then shut down the two rooms 
    closeSettings();
    
  }

  return <>
    <MenuItem data-testid='openMenuButton' onClick={openSettings} disabled={!currentTownIsMergeable}>
      <Typography variant="body1">Temp Voting Button</Typography>
    </MenuItem>
    <Modal isOpen={isOpen} onClose={closeSettings}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Vote to merge with another town</ModalHeader>
        <ModalCloseButton/>
        {/* maybe don't need this form */}
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
    </Modal>
  </>
}


export default TownVoting;
