import React, { useState } from 'react';
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
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import useUser from '../../hooks/useUser';
import useAuthentication from '../../hooks/useAuthentication';
import IAuth from '../Authentication/IAuth';

export default function SimpleCard(): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const history = useHistory();
  const user = useUser();
  const toast = useToast();
  const auth : IAuth = useAuthentication();

  const signInHandler = async () => {
    const credential = { email, password };
    assert(user.actions);
    try {
    await auth.loginWithEmailPassword(credential,user.actions.setAuthState);
    history.push('/');
    } catch(err) {
      toast({
        title: 'Login Failed',
        description: err.toString()
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
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}