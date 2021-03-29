import React, { useState } from 'react';

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
import useAuthInfo from '../../hooks/useAuthInfo';
import IAuth from '../../services/authentication/IAuth';
import RealmAuth from '../../services/authentication/RealmAuth';

export default function SimpleCard(): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const history = useHistory();
  const authInfo = useAuthInfo();
  const toast = useToast();
  const auth : IAuth = RealmAuth.getInstance();

  const signInHandler = async () => {
    const credential = { email, password };
    try {
      await auth.loginWithEmailPassword(credential,authInfo.actions.setAuthState);
      history.push('/');
      toast({
        title: 'Login Successful',
        description: `with email ${email}`,
        status: 'success'
      })
    } catch(err) {
      toast({
        title: 'Login Failed',
        description: err.toString(),
        status: 'error'
      })
    }
  }

  const signInGoogleHandler = async () => {
    try {
      await auth.loginWithGoogle(authInfo.actions.setAuthState);
      history.push('/');
      toast({
        title: 'Login Successful',
        description: 'with Google',
        status: 'success'
      })
    } catch(e) {
      toast({
        title: 'Redirecting to Google failed',
        description: e.toString(),
        status: 'error'
      })
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
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)}/>
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