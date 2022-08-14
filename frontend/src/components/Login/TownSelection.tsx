import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import assert from 'assert';
import React, { useCallback, useEffect, useState } from 'react';
import { CoveyTownInfo, TownJoinResponse } from '../../classes/TownsServiceClient';
import Video from '../../classes/Video/Video';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import { getJwtToken, setJwtToken } from '../../utils';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';

interface TownSelectionProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>;
}

export default function TownSelection({ doLogin }: TownSelectionProps): JSX.Element {
  const [userName, setUserName] = useState<string>(Video.instance()?.userName || '');
  const [newTownName, setNewTownName] = useState<string>('');
  const [newUserName, setNewUserName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [PasswordVisibility, TogglePasswordVisibility] = useState(false);
  const changeConfirmPassword = () => TogglePasswordVisibility(!PasswordVisibility);

  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [townIDToJoin, setTownIDToJoin] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<CoveyTownInfo[]>();
  const { connect: videoConnect } = useVideoContext();
  const { apiClient } = useCoveyAppState();
  const toast = useToast();

  const updateTownListings = useCallback(() => {
    apiClient.listTowns().then(towns => {
      setCurrentPublicTowns(towns.towns.sort((a, b) => b.currentOccupancy - a.currentOccupancy));
    });
  }, [setCurrentPublicTowns, apiClient]);
  useEffect(() => {
    updateTownListings();
    const timer = setInterval(updateTownListings, 2000);
    return () => {
      clearInterval(timer);
    };
  }, [updateTownListings]);

  const handleJoin = useCallback(
    async (coveyRoomID: string) => {
      try {
        if (!userName || userName.length === 0) {
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
        if (getJwtToken() === null) {
          toast({
            title: 'Unable to join town',
            description: 'Please login to join a town',
            status: 'error',
          });
          return;
        }
        const initData = await Video.setup(userName, coveyRoomID);
        const loggedIn = await doLogin(initData);
        if (loggedIn) {
          assert(initData.providerVideoToken);
          await videoConnect(initData.providerVideoToken);
        }
      } catch (err) {
        toast({
          title: 'Unable to connect to Towns Service',
          description: err.toString(),
          status: 'error',
        });
      }
    },
    [doLogin, userName, videoConnect, toast],
  );

  const handleCreate = async () => {
    if (!userName || userName.length === 0) {
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
    if (getJwtToken() === null) {
      toast({
        title: 'Unable to join town',
        description: 'Please login to join a town',
        status: 'error',
      });
      return;
    }
    try {
      const newTownInfo = await apiClient.createTown({
        friendlyName: newTownName,
        isPubliclyListed: newTownIsPublic,
      });
      let privateMessage = <></>;
      if (!newTownIsPublic) {
        privateMessage = (
          <p>
            This town will NOT be publicly listed. To re-enter it, you will need to use this ID:{' '}
            {newTownInfo.coveyTownID}
          </p>
        );
      }
      await handleJoin(newTownInfo.coveyTownID);
      toast({
        title: `Town ${newTownName} is ready to go!`,
        description: (
          <>
            {privateMessage}Please record these values in case you need to change the town:
            <br />
            Town ID: {newTownInfo.coveyTownID}
            <br />
            Town Editing Password: {newTownInfo.coveyTownPassword}
          </>
        ),
        status: 'success',
        isClosable: true,
        duration: null,
      });
    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error',
      });
    }
  };
  /**
   * Handler sign up user.
   */
  const handleSignUp = async () => {
    if (!newUserName || newUserName.length === 0) {
      toast({
        title: 'Unable to sign up user',
        description: 'Please enter a username before sign up user',
        status: 'error',
      });
      return;
    }
    if (!newEmail || newEmail.length === 0) {
      toast({
        title: 'Unable to sign up user',
        description: 'Please enter a email before sign up user',
        status: 'error',
      });
      return;
    }
    if (!newEmail.includes('@')) {
      toast({
        title: 'Unable to sign up user',
        description: 'An email should contain the @ symbol',
        status: 'error',
      });
      return;
    }
    if (!newPassword || newPassword.length === 0) {
      toast({
        title: 'Unable to sign up user',
        description: 'Please enter a newPassword before sign up user',
        status: 'error',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Unable to sign up user',
        description: 'Confirm password not match',
        status: 'error',
      });
      return;
    }
    try {
      await apiClient.signUp({
        userName: newUserName,
        email: newEmail,
        password: newPassword,
      });
      toast({
        title: 'Successfully sign up!',
        status: 'success',
      });
    } catch (err) {
      toast({
        title: 'Unable to create user',
        description: err.toString(),
        status: 'error',
      });
    }
  };

  /**
   * Handler signin user.
   */
  const handleSignIn = async () => {
    if (!loginEmail || loginEmail.length === 0) {
      toast({
        title: 'Unable to sign in user',
        description: 'Please enter a email before signin',
        status: 'error',
      });
      return;
    }
    if (!loginEmail.includes('@')) {
      toast({
        title: 'Unable to sign in user',
        description: 'An email should contain the @ symbol',
        status: 'error',
      });
      return;
    }
    if (!loginPassword || loginPassword.length === 0) {
      toast({
        title: 'Unable to sign in user',
        description: 'Please enter your password before signin',
        status: 'error',
      });
      return;
    }
    try {
      const returnUser = await apiClient.signIn({
        email: loginEmail,
        password: loginPassword,
      });
      toast({
        title: 'Successfully sign in!',
        status: 'success',
      });
      setJwtToken(returnUser.accessToken);
      setUserName(returnUser.username);
    } catch (err) {
      toast({
        title: 'Unable to sign in',
        description: err.toString(),
        status: 'error',
      });
    }
  };

  return (
    <>
      <form>
        <Stack>
          <Box p='4' borderWidth='1px' borderRadius='lg'>
            <Heading as='h2' size='lg'>
              New User?
            </Heading>
            <FormControl>
              <FormLabel mt={2} mb={0} htmlFor='name'>
                Name
              </FormLabel>
              <Input
                autoFocus
                name='name'
                placeholder='Your user name'
                value={newUserName}
                onChange={event => setNewUserName(event.target.value)}
              />
              <FormLabel mt={2} mb={0} htmlFor='name'>
                Email
              </FormLabel>
              <Input
                autoFocus
                name='name'
                placeholder='Your email'
                value={newEmail}
                onChange={event => setNewEmail(event.target.value)}
              />
              <FormLabel mt={2} mb={0} htmlFor='name'>
                Password
              </FormLabel>
              <InputGroup size='md'>
                <Input
                  autoFocus
                  name='name'
                  onChange={event => setNewPassword(event.target.value)}
                  type={PasswordVisibility ? newPassword : 'password'}
                  placeholder='Your password'
                />
                <InputRightElement width='4.5rem'>
                  <Button h='1.75rem' size='sm' onClick={changeConfirmPassword}>
                    {PasswordVisibility ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormLabel mt={2} mb={0} htmlFor='name'>
                Confirm your password
              </FormLabel>
              <InputGroup size='md'>
                <Input
                  autoFocus
                  name='name'
                  //  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  type={PasswordVisibility ? confirmPassword : 'password'}
                  placeholder='Confirm your password'
                />
                <InputRightElement width='4.5rem'>
                  <Button h='1.75rem' size='sm' onClick={changeConfirmPassword}>
                    {PasswordVisibility ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <Button mt={2} colorScheme='blue' data-testid='signUpButton' onClick={handleSignUp}>
                Sign up!
              </Button>
            </FormControl>
          </Box>
          <Box p='4' borderWidth='1px' borderRadius='lg'>
            <Heading as='h2' size='lg'>
              Return User?
            </Heading>
            <FormControl>
              <FormLabel mt={2} mb={0} htmlFor='name'>
                Email
              </FormLabel>
              <Input
                autoFocus
                name='name'
                placeholder='Your Email'
                value={loginEmail}
                onChange={event => setLoginEmail(event.target.value)}
              />
              <FormLabel mt={2} mb={0} htmlFor='name'>
                Password
              </FormLabel>
              <Input
                autoFocus
                name='name'
                placeholder='Your login password'
                value={loginPassword}
                onChange={event => setLoginPassword(event.target.value)}
              />
              <Button mt={2} colorScheme='blue' data-testid='SinginButton' onClick={handleSignIn}>
                Sign in!
              </Button>
            </FormControl>
          </Box>
          <Box p='4' borderWidth='1px' borderRadius='lg'>
            <Heading as='h2' size='lg'>
              Try Covey Town?
            </Heading>

            <FormControl>
              <FormLabel htmlFor='name'>Name</FormLabel>
              <Input
                autoFocus
                name='name'
                placeholder='Your name'
                value={userName || ''}
                onChange={event => setUserName(event.target.value)}
              />
            </FormControl>
          </Box>
          <Box borderWidth='1px' borderRadius='lg'>
            <Heading p='4' as='h2' size='lg'>
              Create a New Town
            </Heading>
            <Flex p='4'>
              <Box flex='1'>
                <FormControl>
                  <FormLabel htmlFor='townName'>New Town Name</FormLabel>
                  <Input
                    name='townName'
                    placeholder='New Town Name'
                    value={newTownName}
                    onChange={event => setNewTownName(event.target.value)}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel htmlFor='isPublic'>Publicly Listed</FormLabel>
                  <Checkbox
                    id='isPublic'
                    name='isPublic'
                    isChecked={newTownIsPublic}
                    onChange={e => {
                      setNewTownIsPublic(e.target.checked);
                    }}
                  />
                </FormControl>
              </Box>
              <Box>
                <Button data-testid='newTownButton' onClick={handleCreate}>
                  Create
                </Button>
              </Box>
            </Flex>
          </Box>
          <Heading p='4' as='h2' size='lg'>
            -or-
          </Heading>

          <Box borderWidth='1px' borderRadius='lg'>
            <Heading p='4' as='h2' size='lg'>
              Join an Existing Town
            </Heading>
            <Box borderWidth='1px' borderRadius='lg'>
              <Flex p='4'>
                <FormControl>
                  <FormLabel htmlFor='townIDToJoin'>Town ID</FormLabel>
                  <Input
                    name='townIDToJoin'
                    placeholder='ID of town to join, or select from list'
                    value={townIDToJoin}
                    onChange={event => setTownIDToJoin(event.target.value)}
                  />
                </FormControl>
                <Button data-testid='joinTownByIDButton' onClick={() => handleJoin(townIDToJoin)}>
                  Connect
                </Button>
              </Flex>
            </Box>

            <Heading p='4' as='h4' size='md'>
              Select a public town to join
            </Heading>
            <Box maxH='500px' overflowY='scroll'>
              <Table>
                <TableCaption placement='bottom'>Publicly Listed Towns</TableCaption>
                <Thead>
                  <Tr>
                    <Th>Town Name</Th>
                    <Th>Town ID</Th>
                    <Th>Activity</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentPublicTowns?.map(town => (
                    <Tr key={town.coveyTownID}>
                      <Td role='cell'>{town.friendlyName}</Td>
                      <Td role='cell'>{town.coveyTownID}</Td>
                      <Td role='cell'>
                        {town.currentOccupancy}/{town.maximumOccupancy}
                        <Button
                          onClick={() => handleJoin(town.coveyTownID)}
                          disabled={town.currentOccupancy >= town.maximumOccupancy}>
                          Connect
                        </Button>
                      </Td>
                    </Tr>
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
