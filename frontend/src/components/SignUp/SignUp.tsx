import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { CoveyUserProfile, EmailPasswordCredential } from '../../CoveyTypes';
import IAuth from '../../services/authentication/IAuth';
import RealmAuth from '../../services/authentication/RealmAuth';
import IDBClient from '../../services/database/IDBClient';
import RealmDBClient from '../../services/database/RealmDBClient';
import useAuthInfo from '../../hooks/useAuthInfo';


export default function SimpleCard(): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const history = useHistory();
  const toast = useToast();
  const auth: IAuth = RealmAuth.getInstance();
  const authInfo = useAuthInfo();
  const dbClient: IDBClient = RealmDBClient.getInstance();

  const createAccountHandler = async () => {
    function validateEmailAndPassword(): boolean {
      if (!email || email.length === 0) {
        toast({
          title: 'Unable to create account',
          description: 'Please enter an email address',
          status: 'error',
          isClosable: true
        })
        return false;
      }
  
      if (!password || password.length === 0) {
        toast({
          title: 'Unable to create account',
          description: 'Please enter a password',
          status: 'error',
          isClosable: true
        })
        return false;
      }
  
      if (!userName || userName.length === 0) {
        toast({
          title: 'Unable to create account',
          description: 'Please enter a username',
          status: 'error',
          isClosable: true
        })
        return false;
      }
  
      if (confirmPassword !== password) {
        toast({
          title: 'Passwords do not match',
          description: 'You must confirm the input password'
        })
        return false;
      }
  
      if (password.length < 8) {
        toast({
          title: 'Invalid password',
          description: 'Passwords must be at least 8 characters'
        })
        return false;
      }
      return true;
    }
    
    if (!validateEmailAndPassword()) {
      return;
    }

    const credential: EmailPasswordCredential = {
      email,
      password
    }

    /** 
     * Initiate registration process.
     * 1. Register email and password account
     * 2. Automatically logins the registered user
     * 3. Initialize a user starter profile
     * 4. Save the user profile
     * 5. If everything is successful,  redirects to home page
     */
    try {
      await auth.registerUserEmailPassword(credential);
      const user = await auth.loginWithEmailPassword(credential, authInfo.actions.setAuthState);
      const newUserProfile: CoveyUserProfile = {
        username: userName,
        email,
        bio: user.profile.bio,
        pfpURL: user.profile.pfpURL
      }
      user.profile = newUserProfile;
      await dbClient.saveUser(user);
      history.push('/');
    } catch (e) {
      if (e.error && e.error !== undefined) {
        toast({
          title: 'Create Account Error',
          description: e.error.toString()
        })
      } else {
        toast({
          title: 'Create Account Error',
          description: e.toString()
        })
      }
    }
  }

  return (
    <Flex
      minH='100vh'
      align='center'
      justify='center'
      bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx='auto' maxW='lg' py={12} px={6}>
        <Stack align='center'>
          <Heading fontSize='4xl'>Create a new account</Heading>
          {/* <Text fontSize='lg' color='gray.600'>
            to enjoy all of our cool <Link color='blue.400'>features</Link> ✌️
          </Text> */}
        </Stack>
        <Box
          rounded='lg'
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow='lg'
          p={8}>
          <Stack spacing={4}>
            <FormControl id="username">
              <FormLabel>Username</FormLabel>
              <Input value={userName} onChange={(event) => setUserName(event.target.value)} />
            </FormControl>
            <FormControl id="email">
              <FormLabel>Email address</FormLabel>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </FormControl>
            <FormControl id="confirmPassword">
              <FormLabel>Confirm Password</FormLabel>
              <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            </FormControl>
            <Stack spacing={10}>

              <Button
                bg='blue.400'
                color='white'
                _hover={{
                  bg: 'blue.500',
                }} onClick={createAccountHandler}>
                Create an account
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}