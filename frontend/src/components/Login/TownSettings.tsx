import React, {useState} from 'react';

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

const TownSettings: React.FunctionComponent = () => {
  const {isOpen, onOpen, onClose} = useDisclosure()
  const {
    apiClient,
    currentTownID,
    currentTownFriendlyName,
    currentTownIsPubliclyListed
  } = useCoveyAppState();
  const [townNameInput, setTownNameInput] = useState<string>(currentTownFriendlyName);
  const [isPublicChecked, setIsPublicChecked] = useState<boolean>(currentTownIsPubliclyListed);
  const [townPasswordInput, setTownPasswordInput] = useState<string>('');
  const toast = useToast()

  const handleTownUpdate = async (actionType: 'delete' | 'update') => {
    let error = false;
    let title = `Town ${actionType}d`;
    let description = '';
    try {
      if (actionType === 'delete') {
        await apiClient.deleteTown({
          coveyTownID: currentTownID,
          coveyTownPassword: townPasswordInput
        });
      } else {
        description = 'To see the updated town, please exit and re-join this town';
        await apiClient.updateTown({
          coveyTownID: currentTownID,
          coveyTownPassword: townPasswordInput,
          isPubliclyListed: isPublicChecked,
          friendlyName: townNameInput,
        });
      }
    } catch (e) {
      title = `Unable to ${actionType} town`;
      description = `Error: ${e.message}`;
      error = true;
    }
    if (actionType === 'update' || error) {
      toast({title, description, status: error ? 'error' : 'success'});
    } else {
      toast({title, status: 'success'});
    }
    onClose();
  }


  return <>
    <MenuItem data-testid='openMenuButton' onClick={onOpen}>
      <Typography variant="body1">Town Settings</Typography>
    </MenuItem>
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Edit town {currentTownFriendlyName} ({currentTownID})</ModalHeader>
        <ModalCloseButton/>
        <form onSubmit={(ev) => {
          ev.preventDefault();
        }}>
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel htmlFor='friendlyName'>Friendly Name</FormLabel>
              <Input
                id='friendlyName'
                placeholder="Friendly Name"
                name="friendlyName"
                value={townNameInput}
                onChange={(e) => setTownNameInput(e.target.value)}/>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel htmlFor='isPubliclyListed'>Publicly Listed</FormLabel>
              <Checkbox
                id="isPubliclyListed"
                name="isPubliclyListed"
                isChecked={isPublicChecked}
                onChange={() => setIsPublicChecked(!isPublicChecked)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="updatePassword">Town Update Password</FormLabel>
              <Input data-testid="updatePassword" id="updatePassword" placeholder="Password"
                     name="password" type="password" value={townPasswordInput}
                     onChange={(e) => setTownPasswordInput(e.target.value)}/>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button data-testid='deletebutton' colorScheme="red"
                    mr={3} value="delete" onClick={() => handleTownUpdate('delete')}>
              Delete
            </Button>
            <Button data-testid='updatebutton' colorScheme="blue" type="submit" mr={3}
                    value="update"
                    onClick={() => handleTownUpdate('update')}>
              Update
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  </>
}

export default TownSettings;
