import React, { useCallback, useState } from 'react';

import {
  Button,
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
import { IUserAccount } from '../../classes/UserAccount';
import { getUser } from '../../classes/api';

const LoginPopUp: React.FunctionComponent = () => {
  const {isOpen, onOpen, onClose} = useDisclosure()
  const video = useMaybeVideo()
  const {apiClient, currentTownID, currentTownFriendlyName, currentTownIsPubliclyListed} = useCoveyAppState();

  const [loginUserName, setLoginUserName] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const[userList, setUserList] = useState<IUserAccount[]>([]);


  const [modal, setModal] = useState(false);
  const toast = useToast()



  // useEffect(() => {
  //   fetchAccount()
  // }, []);



  const openLoginMenu = async ()=>{
    onOpen();
  };

  const closeLoginMenu = async ()=>{
    onClose();
  };

  const fetchAccount = (): void => {
    getUser()
    .then(({ data: { accounts } }: IUserAccount[] | any) => setLoginUserName(accounts))
    .catch((err: Error) => console.log(err))
  }

  const accountList = fetchAccount();

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


    } catch (err) {
      toast({
        title: 'Unable to login with account',
        description: err.toString(),
        status: 'error'
      })
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
