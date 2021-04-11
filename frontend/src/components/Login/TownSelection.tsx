import React, { useCallback, useEffect, useState } from 'react';
import assert from "assert";
import {
  Box,
  Button,
  // Center,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
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
import {UserStatus} from '../../classes/DatabaseServiceClient';
import LoginHooks from './LoginHooks'
import LogoutHooks from './LogoutHooks'
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import Video from '../../classes/Video/Video';
import { CoveyTownInfo, TownJoinResponse, } from '../../classes/TownsServiceClient';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import CoveyTownUser from './User';

interface TownSelectionProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}

export default function TownSelection({ doLogin }: TownSelectionProps): JSX.Element {
  const [userName, setUserName] = useState<string>(Video.instance()?.userName || '');
  const [newTownName, setNewTownName] = useState<string>('');
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [townIDToJoin, setTownIDToJoin] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<CoveyTownInfo[]>();
  const { connect } = useVideoContext();
  const { apiClient, dbClient } = useCoveyAppState();
  const toast = useToast();

  const [currentFriendList, setFriendList] = useState<UserStatus[]>();
  

  // New code
  const userProfile = CoveyTownUser.getInstance();
  const userEmail = userProfile.getUserEmail();
  const userStatus = userProfile.getUserStatus();
  const googleUserName = userProfile.getUserName();
  const [friendEmail, setFriendEmail] = useState<string>('');
  let finalUserName = userName;


  

  const updateFriendList = useCallback(async () => {
    if (googleUserName !== "") {
      const friends = await dbClient.getFriends({ email: userEmail });
      setFriendList(friends);
    }
  }, [dbClient, googleUserName, userEmail]);
  
  useEffect(() => {
    updateFriendList();
    const timer = setInterval(updateFriendList, 2000);
    return () => {
      clearInterval(timer)
    };
  }, [updateFriendList]);
  
  

  const updateTownListings = useCallback(() => {
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


  const handleAddFriend = useCallback(async (newFriendEmail: string) => {
    try {
      const friendExists = await dbClient.userExistence({ email: newFriendEmail });
      if (!friendExists) {
        toast({
          title: `Unable to add ${newFriendEmail}`,
          description: 'Please enter a valid friend email',
          status: 'error',
        });
        return;
      }
      await dbClient.addFriend({ email: userEmail, friendEmail: newFriendEmail });
      toast({
        title: `You added ${newFriendEmail} to your friend list!`,
        description: 'Check the friend list to see if they are online',
        status: 'success',
      });
    } catch (err) {
      toast({
        title: 'Unable to add your friend',
        description: err.toString(),
        status: 'error'
      })
    }
  }, [dbClient, toast, userEmail]);


  const handleDeleteFriend = useCallback(async (friendEmailDelete: string) => {
    try {
      await dbClient.deleteFriend({ email: userEmail, friendEmail: friendEmailDelete });
      toast({
        title: `Success removing ${friendEmailDelete} from your friend list!`,
        status: 'success',
      });
    } catch (err) {
      toast({
        title: `Unable to delete ${friendEmailDelete} from your friend list`,
        description: err.toString(),
        status: 'error'
      })
    }
  }, [dbClient, toast, userEmail]);

  const handleJoin = useCallback(async (coveyRoomID: string, finalName: string) => {
    let newFinalName = finalName;
    if (userProfile.getUserName() !== "" && userProfile.getUserStatus() !== false) {
      newFinalName = userProfile.getUserName();
    }
    try {
      if (!newFinalName || newFinalName.length === 0) {
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
      const initData = await Video.setup(newFinalName, coveyRoomID);

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
  }, [userProfile, doLogin, toast, connect]);

  const handleCreate = async () => {
    if (googleUserName !== "" && userProfile.getUserStatus() !== false) {
      finalUserName = googleUserName;
    }
    else {
      finalUserName = userName;
    }
    if ((!finalUserName || finalUserName.length === 0)) {
      toast({
        title: 'Unable to create town',
        description: 'Please select a username, or log in before creating a town',
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
      await handleJoin(newTownInfo.coveyTownID, finalUserName);
    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error'
      })
    }
  };

  window.onbeforeunload = async () => {

    await dbClient.setOnlineStatus({ email: userEmail, isOnline: false });
    
    }
    
  return (
    <>
      <form>
        <Stack>
          {userStatus ? (
            <Box p="4" borderWidth="1px" borderRadius="lg">
              <Heading p="4" as="h2" size="lg">Hello {userProfile.getUserName()}!</Heading>
              <Heading p="4" as="h4" size="md">Add a Friend</Heading>
              <Flex p="4">
                <FormControl>
                    <Input name="friendEmail" placeholder="Email of your friend"
                       value={friendEmail}
                       onChange={event => setFriendEmail(event.target.value)}/>
                </FormControl>
                  <Button onClick={() => handleAddFriend(friendEmail)}>Add Friend</Button>
              </Flex>
            <Heading p="4" as="h4" size="md">Friend list</Heading>
            <Table>
                <TableCaption placement="bottom">Friends</TableCaption>
                <Thead><Tr><Th>Username</Th><Th>Online</Th><Th>Remove</Th></Tr></Thead>
                <Tbody>

                {currentFriendList?.map((friends) => (
                  <Tr key={friends.email}>
                    <Td role='cell'>{friends.email}</Td>
                    <Td role='cell'>{friends.isOnline ? (
                      <Icon viewBox="0 0 200 200" color="green.500">
                        <path
                          fill="currentColor"
                          d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
                        />
                      </Icon>
                      ) : (
                      <Icon viewBox="0 0 200 200" color="red.500">
                        <path
                          fill="currentColor"
                          d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
                        />
                      </Icon>
                      )}
                    </Td>
                    <Td role='cell'>
                      <Button onClick={() => handleDeleteFriend(friends.email)}>Delete Friend</Button>
                    </Td>
                  </Tr>
                  ))}

                </Tbody>
              </Table>
            <LogoutHooks/>
            </Box>
          ) : (
            <Box p="4" borderWidth="1px" borderRadius="lg">
            <Heading as="h2" size="lg">Select a username</Heading>

            <FormControl>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input autoFocus name="name" placeholder="Your name"
                     value={userName}
                     onChange={event => setUserName(event.target.value)}
              />
            </FormControl>

            <Heading p="4" as="h2" size="lg">-or-</Heading>
            <LoginHooks/>
            </Box>
          )}



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
                        onClick={() => handleJoin(townIDToJoin, finalUserName)}>Connect</Button>
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
                        <Button onClick={() => handleJoin(town.coveyTownID, finalUserName)}
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
