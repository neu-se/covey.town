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
  Text,
  Th,
  Thead,
  Tr,
  useToast
} from '@chakra-ui/react';
import { useAuth0 } from "@auth0/auth0-react";
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { User } from '@auth0/auth0-react/dist/auth-state';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import Video from '../../classes/Video/Video';
import { CoveyTownInfo, CoveySavedTownInfo, TownJoinResponse, } from '../../classes/TownsServiceClient';
import useCoveyAppState from '../../hooks/useCoveyAppState';

interface TownSelectionProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}

function getEmail(isAuthenticated: boolean, user: User): string {
  if (isAuthenticated) {
    return user.email;
  }
  return 'Guest';
}

function getDefaultUsername(isAuthenticated:boolean, user: User){
  if(!isAuthenticated) {
    return 'Guest';
  }
  return user.given_name  || user.nickname;
}

export default function TownSelection({ doLogin }: TownSelectionProps): JSX.Element {
  const { user, isAuthenticated } = useAuth0();
  const [userName, setUserName] = useState<string>(Video.instance()?.userName || getDefaultUsername(isAuthenticated, user));
  const [newTownName, setNewTownName] = useState<string>('');
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [townIDToJoin, setTownIDToJoin] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<CoveyTownInfo[]>();
  const [savedTowns, setSavedTowns] = useState<CoveySavedTownInfo[]>();
  const { connect } = useVideoContext();
  const { apiClient } = useCoveyAppState();
  const toast = useToast();
  const [userExists, setUserExists] = useState<boolean>(false);

  const updateUser = useCallback(async() => {
    if (!userExists && isAuthenticated && user) {

      try {
        await apiClient.logUser({ email: user.email });
      } catch (err) {
        toast({
          title: 'apiClient.logUser failed',
          description: err.toString(),
          status: 'error'
        })
      }
    }
    setUserExists(true);
  }, [apiClient, isAuthenticated, toast, user, userExists]);

  const updateSavedTownListings = useCallback(() => {
    if (!userExists && isAuthenticated && user) {

      apiClient.listSavedTowns({email: user.email})
        .then((towns) => {
          setSavedTowns(towns.towns
            .sort((a, b) => b.currentOccupancy - a.currentOccupancy)
          );
        })
        .catch((err) => {
          toast({
            title: 'Unable to get Saved Towns',
            description: err.toString(),
            status: 'error'
          })
      }) 
    }
  }, [apiClient, isAuthenticated, toast, user, userExists])

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

  useEffect(() => {
    updateUser();
    updateSavedTownListings();
  })

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
      const initData = await Video.setup(userName, coveyRoomID);

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
  }, [doLogin, userName, connect, toast]);

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
        creator: getEmail(isAuthenticated, user),
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

  let savedTownsComponent = <div>
    <Box p="4" borderWidth="1px" borderRadius="lg">
      <Stack align='center' direction="row">
        <BsFillInfoCircleFill/> <Text fontSize="lg">To Use the Saved Towns Feature, Sign up or Log in! </Text>
      </Stack>
    </Box></div>;

  if(isAuthenticated){

    savedTownsComponent = (<div>
      <Heading p="4" as="h4" size="md">Saved Towns</Heading>
        <Box bg="#EBF8FF" maxH="500px" overflowY="scroll" borderWidth="1px" borderRadius="lg">
          <Table>
            <TableCaption placement="bottom">All Saved Towns</TableCaption>
            <Thead><Tr><Th>Town Name</Th><Th>Town ID</Th><Th>Town Type</Th><Th>Activity</Th></Tr></Thead>
            <Tbody>
              {savedTowns?.map((town) => (
                <Tr key={town.coveyTownID}><Td role='cell'>{town.friendlyName}</Td><Td
                  role='cell'>{town.coveyTownID}</Td><Td role='cell'>{town.publicStatus}</Td>
                  <Td role='cell'>{town.currentOccupancy}/{town.maximumOccupancy}
                    <Button onClick={() => handleJoin(town.coveyTownID)}
                            disabled={town.currentOccupancy >= town.maximumOccupancy}>Connect</Button></Td></Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </div>
      )
  }

  return (
    <>
      <form>
        <Stack>
        <Box p="4" borderWidth="1px" borderRadius="lg">
            <Heading as="h2" size="lg">Select a username</Heading>

            <FormControl>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input autoFocus name="name" placeholder="Your name"
                     value={userName}
                     onChange={event => setUserName(event.target.value)}
              />
            </FormControl>
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
            
            <div>{savedTownsComponent}</div>

            <Heading p="4" as="h4" size="md">Select a public town to join</Heading>
            <Box maxH="500px" overflowY="scroll">
              <Table>
                <TableCaption placement="bottom">Publicly Listed Towns</TableCaption>
                <Thead><Tr><Th>Town Name</Th><Th>Town ID</Th><Th>Activity</Th></Tr></Thead>
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
