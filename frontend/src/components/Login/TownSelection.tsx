import React, { useState } from 'react';
import assert from "assert";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast
} from '@chakra-ui/react';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import Video from '../../classes/Video/Video';
import { TownJoinResponse, } from '../../classes/TownsServiceClient';
import useCoveyAppState from '../../hooks/useCoveyAppState';

interface TownSelectionProps {
  doLogin: (iniData: TownJoinResponse) => Promise<boolean>
}

export default function TownSelection({ doLogin }: TownSelectionProps): JSX.Element {
  const [inputUserName, setInputUserName] = useState<string>(Video.instance()?.userName || '');
  const [inputPassword, setInputPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const { connect } = useVideoContext();
  const { apiClient } = useCoveyAppState();
  const toast = useToast();

  const doSignUp = () => {
    // API client should have sign-up route
    setIsLoggedIn(true);
  }

  const doAccountLogin = () => {
    // API client should have login route
    setIsLoggedIn(true);
  }

  const handleJoin = async () => {
    try {
      if (!inputUserName || inputUserName.length === 0) {
        toast({
          title: 'Unable to join town',
          description: 'Please select a username',
          status: 'error',
        });
        return;
      }
      const initData = await Video.setup(inputUserName, 'demoTownID');

      const loggedIn = await doLogin(initData);
      if (loggedIn) {
        assert(initData.providerVideoToken);
        await connect(initData.providerVideoToken);
      }
    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error'
      })
    }
  };

  return (
    <>
      <form>
        <Stack>
          <Box p="4" borderWidth="1px" borderRadius="lg">
            <Heading as="h2" size="lg">Login/Sign Up</Heading>
            { !isLoggedIn ?
              <FormControl>
                <Box mt="5">
                  <FormLabel htmlFor="username">Username</FormLabel>
                  <Input autoFocus name="username" placeholder="Your username"
                         value={ inputUserName }
                         onChange={ event => setInputUserName(event.target.value) }
                  />
                </Box>
                <Box mt="5">
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <Box display='flex' mb="5">
                    <Input autoFocus name="password" placeholder="Your password"
                           value={ inputPassword }
                           onChange={ event => setInputPassword(event.target.value) }
                           type={ showPassword ? 'text' : 'password' }
                    />
                    <Button onClick={ () => setShowPassword(!showPassword) }>{ showPassword ? 'Hide' : 'Show' }</Button>
                  </Box>
                </Box>
              </FormControl>
              :
              <Box>
                {`You are logged in as ${inputUserName}`}`
              </Box>
            }
            <Button data-testid="signup" colorScheme='green' variant='outline' onClick={doSignUp} mr='2'>Sign-up</Button>
            <Button data-testid="login" colorScheme='green' onClick={doAccountLogin}>Login</Button>
          </Box>
          <Box borderWidth="1px" borderRadius="lg">
            <Heading p="4" as="h2" size="lg">Create a New Town</Heading>
            <Flex p="4">
              <Box flex="1">
                <FormControl>
                  <FormLabel htmlFor="townName">New Town Name</FormLabel>
                  <Input name="townName" placeholder="New Town Name"
                  />
                </FormControl>
              </Box><Box>
              <FormControl>
                <FormLabel htmlFor="isPublic">Publicly Listed</FormLabel>
                <Checkbox id="isPublic" name="isPublic"/>
              </FormControl>
            </Box>
              <Box>
                <Button data-testid="newTownButton">Create</Button>
              </Box>
            </Flex>
          </Box>
          <Heading p="4" as="h2" size="lg">-or-</Heading>

          <Box borderWidth="1px" borderRadius="lg">
            <Heading p="4" as="h2" size="lg">Join an Existing Town</Heading>
            <Box borderWidth="1px" borderRadius="lg">
              <Flex p="4"><FormControl>
                <FormLabel htmlFor="townIDToJoin">Town ID</FormLabel>
                <Input name="townIDToJoin" placeholder="ID of town to join, or select from list"/>
              </FormControl>
                <Button data-testid='joinTownByIDButton' onClick={handleJoin}>Connect</Button>
              </Flex>
            </Box>

            <Heading p="4" as="h4" size="md">Select a public town to join</Heading>
            <Box maxH="500px" overflowY="scroll">
              <Table>
                <TableCaption placement="bottom">Publicly Listed Towns</TableCaption>
                <Thead><Tr><Th>Town Name</Th><Th>Town ID</Th><Th>Activity</Th></Tr></Thead>
                <Tbody>
                  <Tr key='demoTownID'><Td role='cell'>DEMO_TOWN_NAME</Td><Td
                    role='cell'>Unknown/Unknown <Button
                    onClick={handleJoin}>Connect</Button></Td></Tr>
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Stack>
      </form>
    </>
  );
}
