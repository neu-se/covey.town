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
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useMaybeVideo from '../../hooks/useMaybeVideo';

const LoginPopUp: React.FunctionComponent = () => {
  const {isOpen, onOpen, onClose} = useDisclosure()
  const video = useMaybeVideo()
  const {apiClient, currentTownID, currentTownFriendlyName, currentTownIsPubliclyListed} = useCoveyAppState();

  const [loginUserName, setLoginUserName] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [modal, setModal] = useState(false);


  const toast = useToast()

  const loginUserAccount = async () =>{
    if(loginUserAccount.length === 0){
        toast({
          title: 'Unable to login',
          description: 'Please enter a username ',
          status: 'error',
        });
        return;
      }
    
    if (userPassword.length === 0) {
      toast({
        title: 'Unable to login',
        description: 'Please enter a password ',
        status: 'error',
      });
      return;
    }

      
  };

  return <>
    <Button data-testid='loginMenu' onClick={loginUserAccount}>
      <Typography variant="body1">Login</Typography>
    </Button>
    <Button data-testid='createAccountMenu' onClick={loginUserAccount}>
      <Typography variant="body1">Create Account</Typography>
    </Button>

    <Modal isOpen={isOpen} onClose={loginUserAccount}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Edit town {currentTownFriendlyName} ({currentTownID})</ModalHeader>
        <ModalCloseButton/>

      </ModalContent>
    </Modal>
  </>
}


export default LoginPopUp;
