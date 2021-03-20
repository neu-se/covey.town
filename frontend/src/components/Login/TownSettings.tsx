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
  useToast,
} from '@chakra-ui/react';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';
import useCoveyAppState from '../../hooks/useCoveyAppState';

const TownSettings: React.FunctionComponent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    apiClient,
    currentTownID,
    currentTownFriendlyName,
    currentTownIsPubliclyListed,
  } = useCoveyAppState();
  const toast = useToast();
  const [updateFriendlyName, setUpdateFriendlyName] = useState<string>('');
  const [updateVisibility, setUpdateVisibility] = useState<boolean>(true);
  const [updatePassword, setUpdatePassword] = useState<string>('');

  const processUpdates = async () => {
    try {
      await apiClient.updateTown({
        friendlyName: updateFriendlyName,
        isPubliclyListed: updateVisibility,
        coveyTownID: currentTownID,
        coveyTownPassword: updatePassword,
      });
      toast({
        title: 'Town updated',
        description: 'To see the updated town, please exit and re-join this town',
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Unable to update town',
        description: `${error.toString()}`,
        status: 'error',
      });
    }
  };

  const handleDeleteTown = async () => {
    try {
      await apiClient.deleteTown({coveyTownID:currentTownID, coveyTownPassword:updatePassword});
      toast({
        title: 'Town deleted',
        status:'success'
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Unable to delete town',
        description: `${error.toString()}`,
        status: 'error',
      });
    }
  };

  return (
    <>
      <MenuItem data-testid='openMenuButton' onClick={onOpen}>
        <Typography variant='body1'>Town Settings</Typography>
      </MenuItem>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Edit town {currentTownFriendlyName} ({currentTownID})
          </ModalHeader>
          <ModalCloseButton />
          <form
            onSubmit={ev => {
              ev.preventDefault();
              processUpdates();
            }}>
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel htmlFor='friendlyName'>Friendly Name</FormLabel>
                <Input
                  id='friendlyName'
                  placeholder='Friendly Name'
                  name='friendlyName'
                  defaultValue={currentTownFriendlyName}
                  onChange={event => setUpdateFriendlyName(event.target.value)}
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel htmlFor='isPubliclyListed'>Publicly Listed</FormLabel>
                <Checkbox
                  id='isPubliclyListed'
                  name='isPubliclyListed'
                  defaultChecked = {currentTownIsPubliclyListed}
                  onChange={event => setUpdateVisibility(event.target.checked)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel htmlFor='updatePassword'>Town Update Password</FormLabel>
                <Input
                  data-testid='updatePassword'
                  id='updatePassword'
                  placeholder='Password'
                  onChange={event => setUpdatePassword(event.target.value)}
                  name='password'
                  type='password'
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button
                data-testid='deletebutton'
                onClick={handleDeleteTown}
                colorScheme='red'
                mr={3}
                value='delete'>
                Delete
              </Button>
              <Button
                data-testid='updatebutton'
                colorScheme='blue'
                type='submit'
                mr={3}
                onClick={onClose}
                value='update'>
                Update
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TownSettings;