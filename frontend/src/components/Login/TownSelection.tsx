import React, { useCallback, useEffect, useState } from 'react';
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
  Text,
  useToast
} from '@chakra-ui/react';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import Video from '../../classes/Video/Video';
import { LoginResponse,CoveyTownInfo, TownJoinResponse} from '../../classes/TownsServiceClient';
import useCoveyAppState from '../../hooks/useCoveyAppState';

interface TownSelectionProps {
  doLogin: (iniData: TownJoinResponse) => Promise<boolean>
}

export default function TownSelection({ doLogin }: TownSelectionProps): JSX.Element {
  const [inputUserName, setInputUserName] = useState<string>(Video.instance()?.userName || '');
  const [inputPassword, setInputPassword] = useState<string>('');
  const [loginResponse, setLoginResponse] = useState<LoginResponse>({
    _id: '',
    username: Video.instance()?.userName || ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [newTownName, setNewTownName] = useState<string>('');
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [townIDToJoin, setTownIDToJoin] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<CoveyTownInfo[]>();
  const { connect } = useVideoContext();
  const { apiClient } = useCoveyAppState();
  const toast = useToast();

  const clearInputAndLogin = (response: LoginResponse) => {
    setInputPassword('')
    setInputUserName('')
    setLoginResponse(response);
    setIsLoggedIn(true);
  }

  const doSignUp = async () => {
    // API client should have sign-up route
    try {
      const response = await apiClient.createAccount({
        username: inputUserName,
        password: inputPassword,
      })

      clearInputAndLogin(response)
    } catch (err) {
      toast({
        title: 'Unable to sign up, please try logging in if this is not your first time.',
        description: err.toString(),
        status: 'error'
      })
    }

  }

  const doAccountLogin = async () => {
    try {
      const response = await apiClient.loginToAccount({
        username: inputUserName,
        password: inputPassword,
      })
      clearInputAndLogin(response)
    } catch (err) {
      toast({
        title: 'Unable to login, please make sure username and password are correct.',
        description: err.toString(),
        status: 'error'
      })
    }
  }

  const updateTownListings = useCallback(() => {
    // console.log(apiClient);
    apiClient.listTowns()
      .then((towns) => {
        setCurrentPublicTowns(towns.towns
          .sort((a, b) => b.currentOccupancy - a.currentOccupancy)
        );
      })
  }, [setCurrentPublicTowns, apiClient]);
  useEffect(() => {
    updateTownListings();
    const timer = setInterval(updateTownListings, 2000);
    return () => {
      clearInterval(timer)
    };
  }, [updateTownListings]);

  const handleJoin = useCallback(async (coveyRoomID: string) => {
    try {
      if (!loginResponse.username || loginResponse.username.length === 0) {
        toast({
          title: 'Unable to join town',
          description: 'Please select a username',
          status: 'error',
        });
        return;
      }
      if (!coveyRoomID || coveyRoomID.length === 0) {
        toast({
          title: 'Unable to join town',
          description: 'Please enter a town ID',
          status: 'error',
        });
        return;
      }
      const initData = await Video.setup(loginResponse.username, coveyRoomID);

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
  }, [doLogin, loginResponse, connect, toast]);

  const handleCreate = async () => {
    if (!loginResponse.username || loginResponse.username.length === 0) {
      toast({
        title: 'Unable to create town',
        description: 'Please select a username before creating a town',
        status: 'error',
      });
      return;
    }
    if (!newTownName || newTownName.length === 0) {
      toast({
        title: 'Unable to create town',
        description: 'Please enter a town name',
        status: 'error',
      });
      return;
    }
    try {
      const newTownInfo = await apiClient.createTown({
        friendlyName: newTownName,
        isPubliclyListed: newTownIsPublic
      });
      let privateMessage = <></>;
      if (!newTownIsPublic) {
        privateMessage =
          <p>This town will NOT be publicly listed. To re-enter it, you will need to use this
            ID: {newTownInfo.coveyTownID}</p>;
      }
      toast({
        title: `Town ${newTownName} is ready to go!`,
        description: <>{privateMessage}Please record these values in case you need to change the
          room:<br/>Town ID: {newTownInfo.coveyTownID}<br/>Town Editing
          Password: {newTownInfo.coveyTownPassword}</>,
        status: 'success',
        isClosable: true,
        duration: null,
      })
      await handleJoin(newTownInfo.coveyTownID);
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
              <Box>
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
                <Button data-testid="signup" colorScheme='green' variant='outline' onClick={doSignUp} mr='2'>Sign-up</Button>
                <Button data-testid="login" colorScheme='green' onClick={doAccountLogin}>Login</Button>
              </Box>
              :
              <Box mt='5'>
                You are logged in as
                <Text fontSize='32px' color='green'>{loginResponse.username}</Text>
                <Button mt='5' onClick={() => setIsLoggedIn(false)}>Sign into a different account</Button>
              </Box>
            }
          </Box>
          <Box borderWidth="1px" borderRadius="lg">
            <Heading p="4" as="h2" size="lg">Create a New Town</Heading>
            <Flex p="4">
              <Box flex="1">
                <FormControl>
                  <FormLabel htmlFor="townName">New Town Name</FormLabel>
                  <Input name="townName" placeholder="New Town Name"
                         value={newTownName}
                         onChange={event => setNewTownName(event.target.value)}
                  />
                </FormControl>
              </Box><Box>
              <FormControl>
                <FormLabel htmlFor="isPublic">Publicly Listed</FormLabel>
                <Checkbox id="isPublic" name="isPublic" isChecked={newTownIsPublic}
                          onChange={(e) => {
                            setNewTownIsPublic(e.target.checked)
                          }}/>
              </FormControl>
            </Box>
              <Box>
                <Button data-testid="newTownButton" onClick={handleCreate}>Create</Button>
              </Box>
            </Flex>
          </Box>
          <Heading p="4" as="h2" size="lg">-or-</Heading>

          <Box borderWidth="1px" borderRadius="lg">
            <Heading p="4" as="h2" size="lg">Join an Existing Town</Heading>
            <Box borderWidth="1px" borderRadius="lg">
              <Flex p="4"><FormControl>
                <FormLabel htmlFor="townIDToJoin">Town ID</FormLabel>
                <Input name="townIDToJoin" placeholder="ID of town to join, or select from list"
                       value={townIDToJoin}
                       onChange={event => setTownIDToJoin(event.target.value)}/>
              </FormControl>
                <Button data-testid='joinTownByIDButton'
                        onClick={() => handleJoin(townIDToJoin)}>Connect</Button>
              </Flex>

            </Box>

            <Heading p="4" as="h4" size="md">Select a public town to join</Heading>
            <Box maxH="500px" overflowY="scroll">
              <Table>
                <TableCaption placement="bottom">Publicly Listed Towns</TableCaption>
                <Thead><Tr><Th>Room Name</Th><Th>Room ID</Th><Th>Activity</Th></Tr></Thead>
                <Tbody>
                  {currentPublicTowns?.map((town) => (
                    <Tr key={town.coveyTownID}><Td role='cell'>{town.friendlyName}</Td><Td
                      role='cell'>{town.coveyTownID}</Td>
                      <Td role='cell'>{town.currentOccupancy}/{town.maximumOccupancy}
                        <Button onClick={() => handleJoin(town.coveyTownID)}
                                disabled={town.currentOccupancy >= town.maximumOccupancy}>Connect</Button></Td></Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Stack>
      </form>
    </>
  );
}
