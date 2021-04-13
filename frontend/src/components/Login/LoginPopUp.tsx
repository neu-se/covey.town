import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  CloseButton,
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
import React, { useState } from 'react';
import { getUser } from '../../classes/api';
import useUserProfile from '../../hooks/useUserProfile';

const LoginPopUp: React.FunctionComponent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setUserProfile } = useUserProfile();

  const [loginUserName, setLoginUserName] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [loginAvatar, setLoginAvatar] = useState<string>('');
  const [error, setErrorMessage] = useState<string | null>(null);

  const [modal, setModal] = useState(false);
  const toast = useToast();

  // useEffect(() => {
  //   fetchAccount()
  // }, []);

  const openLoginMenu = async () => {
    onOpen();
  };

  const closeLoginMenu = async () => {
    onClose();
  };

  const loginUserAccount = async () => {
    try {
      if (loginUserName.length === 0) {
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
      const resetValues = () => {
        setLoginAvatar('');
        setLoginUserName('');
        setUserPassword('');
      };
      const response = await getUser({
        username: loginUserName,
        password: userPassword,
        avatar: loginAvatar,
      });
      const { user } = response.data;
      if (user) {
        resetValues();
        setUserProfile({ ...user, isLoggedIn: true });
        closeLoginMenu();
      } else {
        setErrorMessage(response.data.message || '');
      }
    } catch (err) {
      toast({
        title: 'Unable to login with account',
        description: err.toString(),
        status: 'error',
      });
    }
  };

  return (
    <>
      <Button data-testid='loginMenuButton' onClick={openLoginMenu}>
        Login{' '}
      </Button>
      <Modal isOpen={isOpen} onClose={closeLoginMenu}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log In</ModalHeader>
          <ModalCloseButton />
          {error && (
            <Alert
              status='error'
              flexDirection='column'
              alignItems='center'
              justifyContent='center'
              textAlign='center'>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <CloseButton position='absolute' right='8px' top='8px' />
            </Alert>
          )}
          <form
            onSubmit={ev => {
              ev.preventDefault();
              loginUserAccount();
            }}>
            <ModalBody pb={6}>
              <FormControl isRequired>
                <FormLabel htmlFor='loginAccount'>Enter your avatar</FormLabel>
                <Input
                  id='loginAvatar'
                  placeholder='Enter avatar'
                  name='loginAvatar'
                  value={loginAvatar}
                  onChange={ev => setLoginAvatar(ev.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel htmlFor='loginAccount'>Enter your username</FormLabel>
                <Input
                  id='loginAccount'
                  placeholder='Enter Username'
                  name='loginAccount'
                  value={loginUserName}
                  onChange={ev => setLoginUserName(ev.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor='loginPassword'>Enter your password</FormLabel>
                <Input
                  id='loginPassword'
                  placeholder='Enter Password'
                  name='loginPassword'
                  type='password'
                  value={userPassword}
                  onChange={ev => setUserPassword(ev.target.value)}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button
                data-testid='loginbutton'
                colorScheme='blue'
                mr={3}
                value='login'
                name='action1'
                onClick={() => loginUserAccount()}>
                Log In
              </Button>
              <Button onClick={closeLoginMenu}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LoginPopUp;
