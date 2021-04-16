import React, { useCallback, useState } from 'react';

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
import { useAuth0 } from "@auth0/auth0-react";
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useMaybeVideo from '../../hooks/useMaybeVideo';


const TownSettings: React.FunctionComponent = () => {
  
  const { user, isAuthenticated } = useAuth0();
  const {isOpen, onOpen, onClose} = useDisclosure()
  const video = useMaybeVideo()
  const {apiClient, currentTownID, currentTownFriendlyName, currentTownIsPubliclyListed} = useCoveyAppState();
  const [friendlyName, setFriendlyName] = useState<string>(currentTownFriendlyName);
  const [isPubliclyListed, setIsPubliclyListed] = useState<boolean>(currentTownIsPubliclyListed);
  const [roomUpdatePassword, setRoomUpdatePassword] = useState<string>('');

  const openSettings = useCallback(()=>{
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  const closeSettings = useCallback(()=>{
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);
  
  
  const toast = useToast();
  const processUpdates = async (action: string) =>{
    switch (action) {
      case 'delete':
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
        break;
      case 'edit':
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
        break;
      case 'save':
        try {
          await apiClient.saveTown({
            email: user.email,
            townID: currentTownID
          });
          toast({
            title: 'Town saved!',
            description: 'To see your saved towns, please exit the town. They should be visible on the Town Selection screen and also in your profile',
            status: 'success'
          })
        }catch(err){
          toast({
            title: 'Unable to save town',
            description: err.toString(),
            status: 'error'
          });
        }
        break;
      default:
        break;
    } 
  };
  
  let saveTownButton = <div/>;

  if(isAuthenticated){

    saveTownButton = <Button data-testid='savebutton' colorScheme="green" mr={3} value="save" name='action3' onClick={()=>processUpdates('save')}>
                        Save to Profile  
                      </Button>
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
        <form onSubmit={(ev)=>{ev.preventDefault(); processUpdates('edit')}}>
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel htmlFor='friendlyName'>Friendly Name</FormLabel>
              <Input id='friendlyName' placeholder="Friendly Name" name="friendlyName" value={friendlyName} onChange={(ev)=>setFriendlyName(ev.target.value)} />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel htmlFor='isPubliclyListed'>Publicly Listed</FormLabel>
              <Checkbox id="isPubliclyListed" name="isPubliclyListed"  isChecked={isPubliclyListed} onChange={(e)=>setIsPubliclyListed(e.target.checked)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="updatePassword">Town Update Password</FormLabel>
              <Input data-testid="updatePassword" id="updatePassword" placeholder="Password" name="password" type="password" value={roomUpdatePassword} onChange={(e)=>setRoomUpdatePassword(e.target.value)} />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            {saveTownButton}
            <Button data-testid='deletebutton' colorScheme="red" mr={3} value="delete" name='action1' onClick={()=>processUpdates('delete')}>
              Delete
            </Button>
            <Button data-testid='updatebutton' colorScheme="blue" mr={3} value="update" name='action2' onClick={()=>processUpdates('edit')}>
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
