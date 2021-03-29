import React, { useEffect, useState } from 'react';
import assert from "assert";
import { useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Link,
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
import IAuth from '../../services/authentication/IAuth';
import RealmAuth from '../../services/authentication/RealmAuth';
import useAuthInfo from '../../hooks/useAuthInfo';

interface TownSelectionProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}

export default function TownSelection({ doLogin }: TownSelectionProps): JSX.Element {
  const { connect } = useVideoContext();
  const { apiClient } = useCoveyAppState();
  const history = useHistory();
  const authInfo = useAuthInfo();
  const loggedInUser = authInfo.currentUser
  const toast = useToast();

  if (loggedInUser === null) {
    toast({
      title: "Unable to find user profile",
      description: "Unable to find user profile",
      status: "error"
    })
  }
  const userName = loggedInUser?.profile.userName;

  function handleEditProfile() : void {
    history.push('/profile');
  }

  async function handleLogout() : Promise<void> {
    await authInfo.actions.handleLogout();
    authInfo.actions.setAuthState({
      isLoggedIn: false,
      currentUser: null
    })
    history.push('/login');
  }

  const handleJoin = async () => {
    try {
      if (!userName || userName.length === 0) {
        toast({
          title: 'Unable to join town',
          description: 'Please select a username',
          status: 'error',
        });
        return;
      }
      const initData = await Video.setup(userName, 'demoTownID');

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

  const handleProfile = () => history.push('/profile')

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
            <img src={loggedInUser?.profile.pfpURL}/>
            </Box>
            </Flex>
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
