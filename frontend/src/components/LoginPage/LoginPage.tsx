import React, { useCallback, useState } from 'react';
import assert from 'assert';
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Link,
  Button,
  Heading,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import { io } from 'socket.io-client';
import useAuthInfo from '../../hooks/useAuthInfo';
import IAuth from '../../services/authentication/IAuth';
import RealmAuth from '../../services/authentication/RealmAuth';
import useFriendRequestSocket from '../../hooks/useFriendRequestSocketContext';

export default function SimpleCard(): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const history = useHistory();
  const authInfo = useAuthInfo();
  const toast = useToast();
  const auth: IAuth = RealmAuth.getInstance();
  const friendRequestServerURL = process.env.REACT_APP_FRIEND_REQUEST_SERVICE_URL;
  assert(friendRequestServerURL);
  const { friendRequestSocket: friendRequestSocketState, setFriendRequestSocket } = useFriendRequestSocket();

  const signInHandler = useCallback(async () => {
    const credential = { email, password };
    try {
      const coveyUser = await auth.loginWithEmailPassword(credential, authInfo.actions.setAuthState);

      // If login is successful, establish connection with friend request socket server
      if (coveyUser) {
        if(friendRequestSocketState) {
          friendRequestSocketState.disconnect();
          setFriendRequestSocket(undefined);
        }
        const friendRequestSocket = io(friendRequestServerURL, { auth: { userID: coveyUser.userID } });
        setFriendRequestSocket(friendRequestSocket);
      }
      
      history.push('/');
    } catch (err) {
      if (err.error && err.error !== undefined) {
        toast({
          title: 'Create Account Error',
          description: err.error.toString()
        })
      } else {
        toast({
          title: 'Create Account Error',
          description: err.toString()
        })
      }
    }
  }, [auth, authInfo.actions.setAuthState, email, friendRequestServerURL, history, password, setFriendRequestSocket, toast])
  return (
    <Flex
      minH='100vh'
      align='center'
      justify='center'
      bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx='auto' maxW='lg' py={12} px={6}>
        <Stack align='center'>
          <Heading fontSize='4xl'>Sign in to your account</Heading>
        </Stack>
        <Box
          rounded='lg'
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow='lg'
          p={8}>
          <Stack spacing={4}>
            <FormControl id="email">
              <FormLabel>Email address</FormLabel>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </FormControl>
            <Stack spacing={10}>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                align='start'
                justify='space-between'>
                <Checkbox>Remember me</Checkbox>
                <Link href='/signup' color='blue.400'>Create an Account</Link>
              </Stack>
              <Button
                bg='blue.400'
                color='white'
                _hover={{
                  bg: 'blue.500',
                }} onClick={signInHandler}>
                Sign in
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}