import React, { useState, useEffect } from 'react';
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
import { CoveyTownInfo, TownJoinResponse} from '../../classes/TownsServiceClient';
import useCoveyAppState from '../../hooks/useCoveyAppState';

interface TownSelectionProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}

export default function TownSelection({ doLogin }: TownSelectionProps): JSX.Element {
  const [userName, setUserName] = useState<string>(Video.instance()?.userName || '');
  const { connect } = useVideoContext();
  const { apiClient } = useCoveyAppState();
  const toast = useToast();

  const [localTowns, setLocalTowns] = useState([{
    friendlyName: '',
    coveyTownID: '',
    currentOccupancy: 0,
    maximumOccupancy: 0
  }]);

  useEffect(() => {
    const temp = async () => {
      const {towns} = await apiClient.listTowns();
      towns.sort((t1: CoveyTownInfo, t2: CoveyTownInfo) => t2.currentOccupancy - t1.currentOccupancy);
      setLocalTowns(towns);
    }
    temp();

    const interval = setInterval(async () => {
      const {towns} = await apiClient.listTowns();
      towns.sort((t1: CoveyTownInfo, t2: CoveyTownInfo) => t2.currentOccupancy - t1.currentOccupancy);
      setLocalTowns(towns);
    }, 2000);
    // https://www.w3schools.com/jsref/jsref_sort.asp
    return () => clearInterval(interval);
  }, [apiClient]);

  const [townIDToJoin, setTownIDToJoin] = useState('');
  const [newTownName, setNewTownName] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleJoin = async (townID=townIDToJoin) => {
    try {
      if (!userName || userName.length === 0) {
        toast({
          title: 'Unable to join town',
          description: 'Please select a username',
          status: 'error',
        });
        return;
      }
      if (!townID || townID.length === 0) {
        toast({
          title: 'Unable to join town',
          description: 'Please enter a town ID',
          status: 'error',
        })
        return;
      }

      const initData = await Video.setup(userName, townID);

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

  const createTown = async () => {
    try {
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

      const town = await apiClient.createTown({
        friendlyName: newTownName,
        isPubliclyListed: isPublic,
      })

      toast({
        title: `Town ${newTownName} is ready to go!`,
          description: 'Created town',
          status: 'success',
          isClosable: true,
          duration: null
      })

      handleJoin(town.coveyTownID);
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
            <Heading as="h2" size="lg">Select a username</Heading>
            <FormControl>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input autoFocus name="name" placeholder="Your name"
                     value={userName}
                     onChange={event => setUserName(event.target.value)}
              />
            </FormControl>
          </Box>

          {/* Part 3 starts 3 */}
          <Box borderWidth="1px" borderRadius="lg">
            <Heading p="4" as="h2" size="lg">Create a New Town</Heading>
            <Flex p="4">
              <Box flex="1">
                <FormControl>
                  <FormLabel htmlFor="townName">New Town Name</FormLabel>
                  <Input name="townName"
                    placeholder="New Town Name"
                    onChange={event => setNewTownName(event.target.value)}/>
                </FormControl>
              </Box><Box>
              <FormControl>
                <FormLabel htmlFor="isPublic">Publicly Listed</FormLabel>
                <Checkbox id="isPublic"
                name="isPublic"
                isChecked={isPublic}
                onClick={() => setIsPublic(!isPublic)}/>
              </FormControl>
            </Box>
              <Box>
                <Button data-testid="newTownButton"
                  onClick={createTown}
                >Create</Button>
              </Box>
            </Flex>
          </Box>
          <Heading p="4" as="h2" size="lg">-or-</Heading>

          <Box borderWidth="1px" borderRadius="lg">
            <Heading p="4" as="h2" size="lg">Join an Existing Town</Heading>
            <Box borderWidth="1px" borderRadius="lg">
              <Flex p="4"><FormControl>
                <FormLabel htmlFor="townIDToJoin">Town ID</FormLabel>
                
                {/* Start of Part 2 */}
                <Input name="townIDToJoin"
                placeholder="ID of town to join, or select from list"
                value={townIDToJoin}
                onChange={event => setTownIDToJoin(event.target.value)}/>
              </FormControl>
                <Button data-testid='joinTownByIDButton' onClick={() => handleJoin()}>Connect</Button>
              </Flex>
            </Box>

            <Heading p="4" as="h4" size="md">Select a public town to join</Heading>
            <Box maxH="500px" overflowY="scroll">{/* This is where Part 1 begins */}
              <Table>
                <TableCaption placement="bottom">Publicly Listed Towns</TableCaption>
                <Thead><Tr>
                  <Th>Town Name</Th>
                  <Th>Town ID</Th>
                  <Th>Activity</Th>
                </Tr></Thead>
                {/* This is where Part 1 begins */}
                <Tbody>
                  {
                    localTowns.map(town =>
                      <Tr key={town.coveyTownID}>
                        <Td role='cell'>{town.friendlyName}</Td>
                        <Td role='cell'>{town.coveyTownID}</Td>
                        <Td role='cell'>{town.currentOccupancy}/{town.maximumOccupancy}
                        {/* Second part of Part 2 */}
                        {
                          (town.currentOccupancy < town.maximumOccupancy) &&
                            <Button 
                            onClick={() => handleJoin(town.coveyTownID)}>Connect</Button>
                        }
                        {
                          !(town.currentOccupancy < town.maximumOccupancy) &&
                            <Button disabled>Connect</Button>
                        }
                        </Td>
                      </Tr>
                    )
                  }
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Stack>
      </form>
    </>
  );
}
