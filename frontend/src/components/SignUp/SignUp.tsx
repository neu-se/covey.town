import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

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
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { EmailPasswordCredential } from '../../CoveyTypes';
import IAuth from '../../services/authentication/IAuth';
import RealmAuth from '../../services/authentication/RealmAuth';


export default function SimpleCard(): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const history = useHistory();
  const toast = useToast();
  const auth: IAuth = RealmAuth.getInstance();

  function validateEmailAndPassword() : boolean {
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

  const createAccountHandler = async () => {
    if (!validateEmailAndPassword()) {
      return;
    }

    const credential: EmailPasswordCredential = {
      email,
      password
    }
    await auth.registerUserEmailPassword(credential); 
    history.push('/login');
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
            <FormControl id="email">
              <FormLabel>Email address</FormLabel>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)}/>
            </FormControl>
            <FormControl id="confirmPassword">
              <FormLabel>Confirm Password</FormLabel>
              <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}/>
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