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
import React, { useEffect, useState } from 'react';
import { CoveyTownInfo, TownJoinResponse } from '../../classes/TownsServiceClient';
import Video from '../../classes/Video/Video';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';

interface TownSelectionProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>;
}

export default function TownSelection({ doLogin }: TownSelectionProps): JSX.Element {
  const [userName, setUserName] = useState<string>(Video.instance()?.userName || '');
  const [firstRender, setFirstRender] = useState<boolean>(true);
  const [townListings, setTownListings] = useState<CoveyTownInfo[]>([]);
  const [townID, setTownID] = useState<string>(Video.instance()?.coveyTownID || '');
  const [townName, setTownName] = useState<string>(Video.instance()?.townFriendlyName || '');
  const { connect } = useVideoContext();
  const { apiClient } = useCoveyAppState();
  const toast = useToast();

  // Using useEffect to call the API once mounted and set the data
  useEffect(() => {
    const retrieveTownListings = async () => {
      const result = await apiClient.listTowns();
      setTownListings(
        result.towns.sort((a, b) => (a.currentOccupancy > b.currentOccupancy ? -1 : 1)),
      );
    };
    if (firstRender) {
      retrieveTownListings();
      setFirstRender(false);
    }
    const timer = setTimeout(async () => {
      retrieveTownListings();
    }, 2000);
    return () => clearTimeout(timer);
  }, [townListings, apiClient, firstRender]);

  const handleJoin = async (newTownID?: string) => {
    let currentTownID;
    if (newTownID) {
      currentTownID = newTownID;
    } else {
      currentTownID = townID;
    }
    try {
      if (!userName || userName.length === 0) {
        toast({
          title: 'Unable to join town',
          description: 'Please select a username',
          status: 'error',
        });
        return;
      }
      if (!currentTownID || currentTownID.length === 0) {
        toast({
          title: 'Unable to join town',
          description: 'Please enter a town ID',
          status: 'error',
        });
        return;
      }
      const initData = await Video.setup(userName, currentTownID);
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
  };

  const isMaximumOccupancy = (currentOccupancy: number, maximumOccupancy: number): boolean =>
    currentOccupancy >= maximumOccupancy;

  const handleCreateTown = async () => {
    try {
      if (!userName || userName.length === 0) {
        toast({
          title: 'Unable to create town',
          description: 'Please select a username before creating a town',
          status: 'error',
        });
        return;
      }
      if (!townName || townName.length === 0) {
        toast({
          title: 'Unable to create town',
          description: 'Please enter a town name',
          status: 'error',
        });
        return;
      }
      // do the creation of town here
      const isPublicChecked = document.getElementById('isPublic') as HTMLInputElement;
      const createdRoom = await apiClient.createTown({
        friendlyName: townName,
        isPubliclyListed: isPublicChecked.checked,
      });
      handleJoin(createdRoom.coveyTownID);
      toast({
        title: `Town ${townName} is ready to go!`,
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

  return (
    <>
      <form>
        <Stack>
          <Box p='4' borderWidth='1px' borderRadius='lg'>
            <Heading as='h2' size='lg'>
              Select a username
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
                    onChange={event => setTownName(event.target.value)}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel htmlFor='isPublic'>Publicly Listed</FormLabel>
                  <Checkbox id='isPublic' name='isPublic' defaultChecked />
                </FormControl>
              </Box>
              <Box>
                <Button data-testid='newTownButton' onClick={handleCreateTown}>
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
                    onChange={event => setTownID(event.target.value)}
                  />
                </FormControl>
                <Button data-testid='joinTownByIDButton' onClick={() => handleJoin()}>
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
                  {townListings.map(town => (
                    <Tr key={town.coveyTownID}>
                      <Td role='cell'>{town.friendlyName}</Td>
                      <Td role='cell'>{town.coveyTownID}</Td>
                      <Td role='cell'>
                        {town.currentOccupancy}/{town.maximumOccupancy}{' '}
                        <Button
                          disabled={isMaximumOccupancy(
                            town.currentOccupancy,
                            town.maximumOccupancy,
                          )}
                          onClick={() => handleJoin(town.coveyTownID)}>
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