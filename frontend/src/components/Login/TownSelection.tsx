import React, { useCallback, useEffect, useState } from 'react';
import assert from "assert";
import { useHistory } from 'react-router-dom';
import {
  Avatar,
  AvatarBadge,
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
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import Video from '../../classes/Video/Video';
import { CoveyTownInfo, TownJoinResponse, } from '../../classes/TownsServiceClient';
import useCoveyAppState from '../../hooks/useCoveyAppState';

import useAuthInfo from '../../hooks/useAuthInfo';
import { CoveyUser } from '../../CoveyTypes';
import RealmDBClient from '../../services/database/RealmDBClient';
import useFriendRequestSocket from '../../hooks/useFriendRequestSocketContext';

interface TownSelectionProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}

export default function TownSelection({ doLogin }: TownSelectionProps): JSX.Element {
  const [friendList, setFriendList] = useState<CoveyUser[]>([])
  const [addFriendEmail, setAddFriendEmail] = useState<string>('');
  const authInfo = useAuthInfo();
  const loggedInUser = authInfo.currentUser;
  const db = RealmDBClient.getInstance();
  const [userName, setUserName] = useState<string>(loggedInUser?.profile.username || '');
  const [newTownName, setNewTownName] = useState<string>('');
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [townIDToJoin, setTownIDToJoin] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<CoveyTownInfo[]>();
  const { connect } = useVideoContext();
  const { apiClient } = useCoveyAppState();
  const history = useHistory();
  const toast = useToast();
  const { friendRequestSocket, setFriendRequestSocket } = useFriendRequestSocket();

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

  if (loggedInUser === null) {
    toast({
      title: "Unable to find user profile",
      description: "Unable to find user profile",
      status: "error"
    })
  }

  function handleEditProfile(): void {
    history.push('/profile');
  }

  async function handleLogout(): Promise<void> {
    try {
      await authInfo.actions.handleLogout();

      friendRequestSocket?.disconnect();
      setFriendRequestSocket(undefined);
      // history.push('/login');
    } catch (err) {
      if (err.error) {
        toast({
          title: "Unable to logout",
          description: err.error.toString(),
          status: "error"
        })
      } else {
        toast({
          title: "Unable to logout",
          description: err.toString(),
          status: "error"
        })
      }
    }
  }

  const handleJoin = useCallback(async (coveyRoomID: string) => {
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
      if (loggedInUser) {
        const initData = await Video.setup(userName, loggedInUser?.userID, coveyRoomID);
        const loggedIn = await doLogin(initData);
        if (loggedIn) {
          assert(initData.providerVideoToken);
          await connect(initData.providerVideoToken);
        }
      }
    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error'
      })
    }
  }, [doLogin, userName, connect, toast]);

  const fetchFriend = () => {
    if (loggedInUser) {
      const list: CoveyUser[] = [];
      loggedInUser.friendIDs.map(async (id) => {
        await db.getUser(id)
          .then(response => {
            if (response != null) {
              list.push(response);
            }
            return response;
          });
      });
      setFriendList(list);
    }

    // Test values
    // setFriendList([{
    //   userID: '1',
    //   isLoggedIn: false,
    //   profile: {
    //     username: 'genevieve',
    //     email: 'genevieve@gmail.com',
    //   },
    //   currentTown: null,
    //   friendIDs: [],
    //   actions: {
    //     logout: () => new Promise<void>((resolve, reject) => {})
    //   }
    // },{
    //   userID: '2',
    //   isLoggedIn: true,
    //   profile: {
    //     username: 'nick',
    //     email: 'nick@gmail.com',
    //   },
    //   currentTown: null,
    //   friendIDs: [],
    //   actions: {
    //     logout: () => new Promise<void>((resolve, reject) => {})
    //   }
    // },{
    //   userID: '3',
    //   isLoggedIn: true,
    //   profile: {
    //     username: 'brian',
    //     email: 'brian@gmail.com',
    //   },
    //   currentTown: {
    //     coveyTownID: 'town1',
    //     friendlyName: 'friendly room'
    //   },
    //   friendIDs: [],
    //   actions: {
    //     logout: () => new Promise<void>((resolve, reject) => {})
    //   }
    // }])
  }

  useEffect(() => {
    fetchFriend()
  }, [authInfo])

  const handleProfile = () => history.push('/profile')
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
          room:<br />Town ID: {newTownInfo.coveyTownID}<br />Town Editing
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

  const handleAddFriend = () => {
    if (addFriendEmail.length > 0) {
      // TODO: Find user with given addFriendEmail and call DB to add friend
      toast({
        title: `Unable to add friend`,
        description: `Unable to find a user with email ${addFriendEmail}`,
        status: 'error'
      })
      toast({
        title: `Successfully added friend`,
        description: `${addFriendEmail} is now your friend!`,
        status: 'success'
      })
    } else {
      toast({
        title: 'Enter a valid email to add friend',
        description: `You didn't enter a valid email address`,
        status: 'info'
      })
    }
  }

  return (
    <>
      <form>
        <Stack>
          <Box p="4" borderWidth="1px" borderRadius="lg">
            <Heading as="h2" size="lg">You are logged in as: {userName}</Heading>
            <Flex p="4">
              <Box flex="1">
                <FormControl>
                  <div>
                    <Button data-testid="editProfileButton"
                      onClick={() => handleEditProfile()}>Edit or View Profile</Button>
                    <Button m={1} data-testid="logoutButton"
                      onClick={() => handleLogout()}>Logout</Button>
                  </div>
                </FormControl>
                <img src={loggedInUser?.profile.pfpURL} alt="" />
              </Box>
            </Flex>
          </Box>

          <Box p="4" borderWidth="1px" borderRadius="lg">
            <Heading as="h2" size="lg">Friends:</Heading>
            {
              friendList.length > 0 ?
                <Box maxH="500px" overflowY="scroll">
                  <Table>
                    <Thead><Tr><Th>Friend Name</Th><Th>Status</Th><Th>Join friend&apos;s town</Th></Tr></Thead>
                    <TableCaption placement="top">Online</TableCaption>
                    <Tbody>
                      {
                        friendList.map(friend => friend.isLoggedIn &&
                          <Tr key={friend.userID}>
                            <Td role='cell'>
                              <Flex>
                                <Avatar size="2xs" src={friend.profile.pfpURL} marginRight="5px">
                                  <AvatarBadge boxSize="1.25em" bg="green.500" />
                                </Avatar>
                                {friend.profile.username}
                              </Flex>
                            </Td>
                            <Td role='cell'>{
                              (friend.currentTown && friend.currentTown !== null) ? `In room ${friend.currentTown.coveyTownID}` : 'In lobby'
                            }</Td>
                            {
                              (friend.currentTown && friend.currentTown !== null) ? <Td><Button onClick={() => { if (friend.currentTown && friend.currentTown !== null) { handleJoin(friend.currentTown.coveyTownID) } }}>Connect</Button></Td> : <Td />
                            }
                          </Tr>)
                      }
                    </Tbody>
                  </Table>
                  <Table>
                    <TableCaption placement="top">Offline</TableCaption>
                    <Tbody>
                      {
                        friendList.map(friend => !friend.isLoggedIn &&
                          <Tr key={friend.userID}>
                            <Td role='cell'>
                              <Flex>
                                <Avatar size="2xs" src={friend.profile.pfpURL} marginRight="5px">
                                  <AvatarBadge boxSize="1.25em" bg="gray.50" />
                                </Avatar>
                                {friend.profile.username}
                              </Flex>
                            </Td>
                          </Tr>)
                      }
                    </Tbody>
                  </Table>
                </Box> :
                <Heading p="4" as="h6" size="sm">You have no friends <span aria-label="a very sad face" role="img">😔</span></Heading>
            }

            <Box marginTop="2">
              <FormControl>
                <FormLabel htmlFor="addFriendEmail">Add friend</FormLabel>
                <Flex>
                  <Input name="addFriendEmail" placeholder="Add friend using their email address" value={addFriendEmail} onChange={event => setAddFriendEmail(event.target.value)} />
                  <Button marginLeft="2" onClick={handleAddFriend}>Add</Button>
                </Flex>
              </FormControl>
            </Box>
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
              </Box>
              <Box>
                <FormControl>
                  <FormLabel htmlFor="isPublic">Publicly Listed</FormLabel>
                  <Checkbox id="isPublic" name="isPublic" isChecked={newTownIsPublic}
                    onChange={(e) => {
                      setNewTownIsPublic(e.target.checked)
                    }} />
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
                  onChange={event => setTownIDToJoin(event.target.value)} />
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
