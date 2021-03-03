import React from 'react';

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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { apiClient, currentTownID, currentTownFriendlyName, currentTownIsPubliclyListed } = useCoveyAppState();

  const toast = useToast()
  const processUpdates = async () => {
    toast({
      title: 'debug, remove this when you implement the functionality',
      description: `
      current status: town ID: ${currentTownID}, is public: ${currentTownIsPubliclyListed},
      friendlyName: ${currentTownFriendlyName}`,
      status: 'info'
    })
  };

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
          processUpdates();
        }}>
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel htmlFor='friendlyName'>Friendly Name</FormLabel>
              <Input id='friendlyName' placeholder="Friendly Name" name="friendlyName" />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel htmlFor='isPubliclyListed'>Publicly Listed</FormLabel>
              <Checkbox id="isPubliclyListed" name="isPubliclyListed"/>
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="updatePassword">Town Update Password</FormLabel>
              <Input data-testid="updatePassword" id="updatePassword" placeholder="Password"
                     name="password" type="password"/>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button data-testid='deletebutton' colorScheme="red" mr={3} value="delete">
              Delete
            </Button>
            <Button data-testid='updatebutton' colorScheme="blue" type="submit" mr={3}
                    onClick={() => processUpdates()}
                    value="update">
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
