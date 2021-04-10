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
  const [friendRequestList, setFriendRequestList] = useState<CoveyUser[]>([])
  const [friendRequestIDList, setFriendRequestIDList] = useState<string[]>([])
  const [addFriendID, setAddFriendID] = useState<string>('');
  const authInfo = useAuthInfo();
  const loggedInUser = authInfo.currentUser;
  assert(loggedInUser);
  const db = RealmDBClient.getInstance();
  const [userName, setUserName] = useState<string>(loggedInUser.profile.username || '');
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
    apiClient.listTowns()
      .then((towns) => {
        setCurrentPublicTowns(towns.towns
          .sort((a, b) => b.currentOccupancy - a.currentOccupancy)
        );
      })
  }, [setCurrentPublicTowns, apiClient]);

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
  }, [userName, loggedInUser.userID, doLogin, toast, connect]);

  const addFriendRequestToList = (request: CoveyUser) => {
    if (friendRequestList.filter(user => user.userID === request.userID).length === 0) {
      setFriendRequestList(currentList => [...currentList, request]);
    }
  }

  const handleIncomingRequest = async (userID: string) => {
    if (friendRequestIDList.filter(id => id === userID).length === 0) {
      setFriendRequestIDList([...friendRequestIDList, userID]);
      await db.getUser(userID)
        .then(response => {
          if (response) {
            addFriendRequestToList(response)
          }
        })
    }
  }

  const handleRejectFriend = async (userID: string) => {
    setFriendRequestIDList(friendRequestIDList.filter(id => id !== userID))
    setFriendRequestList(friendRequestList.filter(user => user.userID !== userID))
    if (loggedInUser) {
      try {
        await db.saveFriendRequests({
          userID: loggedInUser.userID,
          requests: friendRequestIDList.filter(id => id !== userID)
        })
      } catch (e) {
        toast({
          title: 'Unable to add friend from authinfo',
          description: e.toString(),
          status: 'error'
        })
      }
    }
  }

  const handleAcceptRequest = async (userID: string) => {
    if (loggedInUser) {
      if (loggedInUser.friendIDs.indexOf(userID) < 0) {
        // Update this user's friend list in auth info
        loggedInUser.friendIDs = [...loggedInUser.friendIDs, userID];
        handleRejectFriend(userID);
      }
    }
  }

  useEffect(() => {
    if (friendRequestSocket && friendRequestSocket.disconnected) {
      friendRequestSocket.connect();
      friendRequestSocket.on('receiveRequest', handleIncomingRequest);
      friendRequestSocket.on('friendRequestAccepted', handleAcceptRequest);
    }
    return () => { };
  })

  const handleSendFriendRequest = async () => {
    if (addFriendID.length < 1) {
      toast({
        title: 'Enter a valid user ID to send friend request',
        description: `You didn't enter a valid user ID`,
        status: 'info'
      })
      return;
    }
    if (!friendRequestSocket) {
      toast({
        title: `Unable to send friend request`,
        description: `Friend Request Socket is null`,
        status: 'error'
      })
      return;
    }
    friendRequestSocket.emit('sendRequest', addFriendID);
    if (loggedInUser) {
      await db.getFriendRequests(addFriendID)
        .then(async (response) => {
          if (response) {
            console.log(response.requests);
            await db.saveFriendRequests({
              userID: addFriendID,
              requests: [...response.requests, loggedInUser.userID]
            })
          } else {
            await db.saveFriendRequests({
              userID: addFriendID,
              requests: [loggedInUser.userID]
            })
          }
        })
    }
    toast({
      title: `Successfully sent friend request`,
      description: `A friend request has been sent to user ID ${addFriendID}!`,
      status: 'success'
    })
  }

  const fetchFriend = async () => {
    if (loggedInUser) {
      await db.getUser(loggedInUser.userID)
        .then(user => {
          if(user) {
            const list: CoveyUser[] = [];
            console.log(user.friendIDs)
            user.friendIDs.map(async (id) => {
              await db.getUser(id)
                .then(response => {
                  if (response) {
                    console.log(response)
                    list.push(response);
                  }
                  return response;
                })
                .then(() => setFriendList(list));
              });
          }
        })
    }
  }

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

  const populateFriendRequest = async () => {
    if (loggedInUser) {
      await db.getFriendRequests(loggedInUser.userID)
        .then(response => {
          if (response) {
            response.requests.map(async (requestID) => {
              const requestUser = await db.getUser(requestID);
              if (requestUser) {
                addFriendRequestToList(requestUser);
              }
            })
            console.log(response.requests);
            setFriendRequestIDList(response.requests);
          }
        })
    }
  }

  useEffect(() => {
    updateTownListings();
    const timer = setInterval(updateTownListings, 2000);
    // Fetch friend IDs from authInfo and CoveyUser objects from db
    fetchFriend();
    // Fetch friend requests IDs from db, assign to state's friendRequestIDList, assign CoveyUser objects to state's FriendRequestList
    populateFriendRequest();
    return () => {
      clearInterval(timer)
    };
  }, [updateTownListings]);

  // Filter state's friend request list for unique items and return list of CoveyUsers for render
  function filteredFriendRequests(): (CoveyUser | undefined)[] {
    const mapped = friendRequestList.map((request) => request.userID);
    const filtered = mapped.filter((id, index) => mapped.indexOf(id) === index);
    const result = filtered.map(id => {
      const userRequest = friendRequestList.find(user => user.userID === id);
      if (userRequest) { return userRequest; } return undefined;
    });
    console.log(friendRequestList)
    console.log(result)
    return result;
  }

  const handleAddFriend = async (userID: string) => {
    if (loggedInUser) {
      if (loggedInUser.friendIDs.indexOf(userID) < 0) {
        if(friendRequestSocket) {
          friendRequestSocket.emit('acceptRequest', userID);
        }
        // Update this user's friend list in auth info
        loggedInUser.friendIDs = [...loggedInUser.friendIDs, userID];
        // Update this user's friend list in db
        try {
          await db.saveUser(loggedInUser);
        } catch (e) {
          toast({
            title: 'Unable to add friend from db',
            description: e.toString(),
            status: 'error'
          })
        }
        // Update friend's friend list on db and add them to state's friend list
        await db.getUser(userID)
          .then(async (response) => {
            if (response) {
              setFriendList([...friendList, response]);
              const friend = JSON.parse(JSON.stringify(response));
              friend.friendIDs = [...friend.friendIDs, loggedInUser.userID];
              try {
                console.log(friend);
                await db.saveUser(friend);
              } catch (e) {
                toast({
                  title: `Error updating friend's friendlist`,
                  description: e.toString(),
                  status: 'error'
                })
              }
            }
          })
        handleRejectFriend(userID);
      }
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
            <Flex justifyContent="space-between">
              <Heading as="h2" size="lg">Friends:</Heading>
              <Button alignSelf="right" onClick={fetchFriend}>Refresh</Button>
            </Flex>
            {
              friendList.length > 0 ?
                <Box maxH="500px" overflowY="auto">
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

            {
              friendRequestIDList.length > 0 ?
                <Box maxH="500px" overflowY="auto">
                  <Table>
                    <TableCaption placement="top">Pending friend requests</TableCaption>
                    <Tbody>
                      {
                        filteredFriendRequests().map(friend =>
                          friend !== undefined &&
                          <Tr key={friend.userID}>
                            <Td role='cell'>
                              <Flex>
                                <Avatar size="2xs" src={friend.profile.pfpURL} marginRight="5px" />
                                {friend.profile.username}
                              </Flex>
                            </Td>
                            <Td role='cell'>
                              <Flex justifyContent="flex-end">
                                <Button marginRight="2" onClick={() => handleAddFriend(friend.userID)}>Add</Button>
                                <Button onClick={() => handleRejectFriend(friend.userID)}>Remove</Button>
                              </Flex>
                            </Td>
                          </Tr>)
                      }
                    </Tbody>
                  </Table>
                </Box> :
                <span />
            }

            <Box marginTop="2">
              <FormControl>
                <FormLabel htmlFor="addFriendID">Add friend</FormLabel>
                <Flex>
                  <Input name="addFriendID" placeholder="Send friend request using their user ID" value={addFriendID} onChange={event => setAddFriendID(event.target.value)} />
                  <Button marginLeft="2" onClick={handleSendFriendRequest}>Send friend request</Button>
                </Flex>
                <Heading p="4" as="h6" size="md">Your user ID is {loggedInUser ? loggedInUser.userID : 'Error'}</Heading>
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
