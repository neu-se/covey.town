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
  useToast,
} from '@chakra-ui/react';
import assert from 'assert';
import React, { useCallback, useEffect, useState } from 'react';
import { CoveyTownInfo, TownJoinResponse } from '../../classes/TownsServiceClient';
import Video from '../../classes/Video/Video';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import AvatarSelection from './AvatarSelection';
import useUserProfile from '../../hooks/useUserProfile';
import { updateUser } from '../../classes/api'

interface TownSelectionProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>;
}

export default function TownSelection({ doLogin }: TownSelectionProps): JSX.Element {
  const [userName, setUserName] = useState<string>(Video.instance()?.userName || '');
  const [avatarID, setAvatarID] = useState<string>(Video.instance()?.avatarID || '');
  const [newTownName, setNewTownName] = useState<string>('');
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [townIDToJoin, setTownIDToJoin] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<CoveyTownInfo[]>();
  const { connect } = useVideoContext();
  const { apiClient } = useCoveyAppState();
  const toast = useToast();
  const { userProfile } = useUserProfile();
  const { setUserProfile } = useUserProfile();

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

  useEffect(() => {
    if (userProfile) {
      setUserName(userProfile.username);
      setAvatarID(userProfile?.avatar);
    }
    else
      setUserName('');
  }, [userProfile])

  const handleQuickJoin = useCallback(async () => {
    try {
      if (currentPublicTowns?.length === 0) {
        toast({
          title: 'Unable to join town',
          description: 'There are no availabale rooms to join',
          status: 'error',
        });
        return;
      }

      let firstCoveyRoomID: string | undefined;
      const townsHaveSpace = currentPublicTowns?.some(town => {
        firstCoveyRoomID = town.coveyTownID;
        return town.currentOccupancy < town.maximumOccupancy;
      });

      if (!townsHaveSpace) {
        toast({
          title: 'Unable to join town',
          description: 'All rooms are full try creating a new one',
          status: 'error',
        });
        return;
      }

      const quickUserName = userName === '' ? 'Quick User' : userName;

      const initData = await Video.setup(quickUserName, String(firstCoveyRoomID), avatarID);

      const loggedIn = await doLogin(initData);

      if (loggedIn) {
        assert(initData.providerVideoToken);
        await connect(initData.providerVideoToken);
      }
    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error',
      });
    }
  }, [currentPublicTowns, doLogin, userName, connect, toast, avatarID]);

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
        const initData = await Video.setup(userName, coveyRoomID, avatarID);

        const loggedIn = await doLogin(initData);
        if (loggedIn) {
          assert(initData.providerVideoToken);
          await connect(initData.providerVideoToken);
        }
      } catch (err) {
        toast({
          title: 'Unable to connect to Towns Service',
          description: err.toString(),
          status: 'error',
        });
      }
    },
    [doLogin, userName, connect, toast, avatarID],
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
      toast({
        title: `Town ${newTownName} is ready to go!`,
        description: (
          <>
            {privateMessage}Please record these values in case you need to change the room:
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
      await handleJoin(newTownInfo.coveyTownID);
    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error',
      });
    }
  };

  const handleUpdate = async () => {

    try {
      if (userName.length === 0) {
        toast({
          title: 'Unable to update',
          description: 'Please enter a username ',
          status: 'error',
        });
        setUserName(userProfile ? userProfile.username: '')
        return;
      }
      
      const response = await updateUser({
        username: userName,
        avatar: avatarID
      }, userProfile ? userProfile.userID: '');

      const {user} = response.data;

      if (user) {        
        setUserProfile({ ...user, isLoggedIn: true });
      }
      toast({
        title: 'Account updated :)',
        description: 'Remember: if you changed your name you will use the UPDATED one to log in again!',
        status: 'success',
        duration: null,
        isClosable: true
      })

    } catch (err) {
      toast({
        title: 'Unable to update',
        description: err.toString(),
        status: 'error',
      });
    }
  };

  return (
    <>
      <form>
        <Stack>
          {
              !userProfile &&
              <>
                <Box p='4' borderWidth='1px' borderRadius='lg'>
                  <Heading as='h2' size='lg'>
                    Single click guest
                  </Heading>
                  <p>Join the bussiest available room. We will select your username and avatar</p>
                  <Button width='200px' data-testid='quickJoin' onClick={() => handleQuickJoin()}>
                    Quick join!
                  </Button>
                </Box>
                <Heading p='4' as='h2' size='lg'>
                  -or-
                </Heading>
              </>
            }
          
          <Box p='4' borderWidth='1px' borderRadius='lg'>
            <Heading as='h2' size='lg'>
              Select a username and avatar
            </Heading>

            <FormControl>
              <FormLabel htmlFor='name'>Name</FormLabel>
              
              <Input
                autoFocus
                name='name'
                placeholder='Your name'
                value={userName}
                onChange={event => setUserName(event.target.value)}
              />
            </FormControl>
            <AvatarSelection setAvatarId={setAvatarID} />
            {
              userProfile &&
             
              <Button align='right' marginTop='10px' onClick={() => handleUpdate()}>
                Update username and/or avatar
              </Button>
            }
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
                    <Th>Room Name</Th>
                    <Th>Room ID</Th>
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
