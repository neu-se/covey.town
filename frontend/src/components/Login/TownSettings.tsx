import React, {useState, useCallback} from 'react';

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
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useMaybeVideo from '../../hooks/useMaybeVideo';

const TownSettings: React.FunctionComponent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { apiClient, currentTownID, currentTownFriendlyName, currentTownIsPubliclyListed } = useCoveyAppState();
  const video = useMaybeVideo()

  const openSettings = useCallback(()=>{
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  const closeSettings = useCallback(()=>{
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);

  const [friendlyName, setFriendlyName] = useState(currentTownFriendlyName);
  const [isPublic, setIsPublic] = useState(currentTownIsPubliclyListed);
  const [password, setPassword] = useState('');

  const toast = useToast()
  const processUpdates = async () => {
    try {
      await apiClient.updateTown({
        coveyTownID: currentTownID,
        coveyTownPassword: password,
        friendlyName,
        isPubliclyListed: isPublic,
      })
      toast({
        title: 'Town updated',
        description: 'To see the updated town, please exit and re-join this town',
        status: 'success',
      })
      onClose();
    } catch (err) {
      toast({
        title: 'Unable to update town',
        description: err.toString(),
        status: 'error'
      })
    }
  };

  const deleteTown = async () => {
    try {
      await apiClient.deleteTown({
        coveyTownID: currentTownID,
        coveyTownPassword: password,
      })
      toast({
        title: 'Town deleted',
        status: 'success',
      })
      onClose();
    } catch (err) {
      toast({
        title: 'Unable to delete town',
        description: err.toString(),
        status: 'error'
      })
    }
  }

  return <>
    <MenuItem data-testid='openMenuButton' onClick={openSettings}>
      <Typography variant="body1">Town Settings</Typography>
    </MenuItem>
    <Modal isOpen={isOpen} onClose={closeSettings}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Edit town {currentTownFriendlyName} ({currentTownID})</ModalHeader>
        <ModalCloseButton/>
        <form onSubmit={(ev) => {
          ev.preventDefault();
          processUpdates();
        }}>
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel htmlFor='friendlyName'>Friendly Name</FormLabel>
              <Input id='friendlyName' value={friendlyName} name="friendlyName"
                onChange={e => setFriendlyName(e.target.value)}/>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel htmlFor='isPubliclyListed'>Publicly Listed</FormLabel>
              <Checkbox id="isPubliclyListed" name="isPubliclyListed"
                isChecked={isPublic}
                onClick={() => setIsPublic(!isPublic)}/>
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="updatePassword">Town Update Password</FormLabel>
              <Input data-testid="updatePassword" id="updatePassword" placeholder="Password"
                     name="password" type="password"
                     value={password}
                     onChange={e => setPassword(e.target.value)}/>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button data-testid='deletebutton' colorScheme="red" mr={3} value="delete"
              onClick={() => deleteTown()}>
              Delete
            </Button>
            <Button data-testid='updatebutton' colorScheme="blue" type="submit" mr={3}
                    onClick={() => processUpdates()}
                    value="update">
              Update
            </Button>
            <Button onClick={closeSettings}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  </>
}

export default TownSettings;
