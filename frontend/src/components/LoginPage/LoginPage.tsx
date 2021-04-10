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
  Image,
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

  const [windowObjectReference, setWindowObjectReference] = useState<Window | null>(null);
  const receiveMessage = useCallback(async (event: MessageEvent<any>) => {

    // Do we trust the sender of this message? (might be
    // different from what we originally opened, for example).
    if (event.origin !== 'http://localhost:3000') {
      return;
    }
    const { data } = event;
    // if we trust the sender and the source is our popup
    if (data.source === 'coveytown-google-redirect') {
      // get the URL params and redirect to our server to use Passport to auth/login
      const { payload } = data;
      // const redirectUrl = `/auth/google/login${payload}`;
      // window.location.pathname = redirectUrl;
      try{
      const coveyUser = await auth.loginWithGoogle(payload, authInfo.actions.setAuthState);
      authInfo.actions.setAuthState({currentUser:coveyUser});
      } catch (err) {
        toast({
          title: 'Create Account Error',
          description: err.toString()
        })
      }
      history.push('/');
    } 
  }, [auth, authInfo.actions, history, toast]);

  const openSignIn = useCallback((url: string) => {
    let previousUrl: string | null = null;
    // remove any existing event listeners
    window.removeEventListener('message', receiveMessage);
    window.addEventListener('message', event => receiveMessage(event), false);
    // window features
    const strWindowFeatures =
      'toolbar=no, menubar=no, width=600, height=700, top=100, left=100';

    const mapForm = document.createElement("form");
    mapForm.target = "Map";
    mapForm.method = "GET"; // or "post" if appropriate
    mapForm.action = "https://accounts.google.com/o/oauth2/v2/auth";

    const clientID = process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID;
    assert(clientID);
    const oparams = {
      client_id: clientID,
      redirect_uri: 'http://localhost:3000/redirect',
      response_type: 'id_token token',
      nonce: '0394852-3190485-2490358',
      scope: 'openid profile email',
      access_type: 'online',
      include_granted_scopes: 'true'
    };

    Object.entries(oparams).forEach((param) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', param[0]);
      input.setAttribute('value', param[1]);
      mapForm.appendChild(input);
    })

    document.body.appendChild(mapForm);
    if (!windowObjectReference || windowObjectReference.closed) {
      /* if the pointer to the window object in memory does not exist
       or if such pointer exists but the window was closed */
      setWindowObjectReference(window.open('', 'Map', strWindowFeatures));
      mapForm.submit();
    } else if (previousUrl !== url) {
      /* if the resource to load is different,
       then we load it in the already opened secondary window and then
       we bring such window back on top/in front of its parent window. */
      setWindowObjectReference(window.open('', 'Map', strWindowFeatures));
      mapForm.submit();
      windowObjectReference?.focus();
    } else {
      /* else the window reference must exist and the window
       is not closed; therefore, we can bring it back on top of any other
       window with the focus() method. There would be no need to re-create
       the window or to reload the referenced resource. */
      windowObjectReference.focus();
    }
    // assign the previous URL
    previousUrl = url;
  }, [receiveMessage, windowObjectReference]);

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
  }, [auth, authInfo.actions.setAuthState, email, friendRequestServerURL, friendRequestSocketState, history, password, setFriendRequestSocket, toast])
  
  const signInGoogleHandler = useCallback(()=> {
    try{
    openSignIn("http://localhost:3000/login");
    } catch (err) {
      toast({
        title: 'Create Account Error',
        description: err.toString()
      })
    }
  },[openSignIn, toast]);

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
              <Button
                bg='red.400'
                color='white'
                _hover={{
                  bg: 'red.500',
                }} onClick={signInGoogleHandler}>
                Sign in with Google
                <Image src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="" maxHeight="20px" maxWidth="20px" marginLeft="5px"/>
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}