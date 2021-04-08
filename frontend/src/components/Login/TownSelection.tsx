import React, { useCallback, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
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
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  Stack,
  Table,
  TableCaption,
  Tbody,
  Text,
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


interface TownSelectionProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}

enum RelationshipStatus {
  Single = "single",
  Taken = "taken",
}

interface CoveyUser {
  userID: string,
  username: string,
  password: string,
  isPublic: boolean,
  email?: string,
  bio?: string,
  hobbies?: string,
  firstName?: string,
  lastName?: string,
  dob?: string,
  relationshipStatus?: RelationshipStatus
}

export default function TownSelection({ doLogin }: TownSelectionProps): JSX.Element {
  const toast = useToast();
  const { isAuthenticated, user } = useAuth0();
  const [userName, setUserName] = useState<string>(Video.instance()?.userName || '');
  const [newTownName, setNewTownName] = useState<string>('');
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [townIDToJoin, setTownIDToJoin] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<CoveyTownInfo[]>();
  const { connect } = useVideoContext();
  const { apiClient } = useCoveyAppState();
  const [coveyUser, setCoveyUser] = useState<CoveyUser>({
    userID: "123",
    username: "Scott",
    password: "Pass123$",
    isPublic: false,
  });
  const [editting, setEditting] = useState<boolean>(false);

  const fetchUserInformation = () => {
    const url = ""; // getUsersByID Rest endpoint
    const data = {
      userId: "someID" // the user id we want to use
    }
    fetch(url, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then((res) => res.json())
      .then((obj) => {
        if (obj.status === "isOK") {
          setCoveyUser(obj.data);
        }
        else {
          // error message
        }
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    fetchUserInformation();
  }, user)



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

  const renderPopulatedFields = (currentUser: CoveyUser) => {
    const fields: JSX.Element[] = [];
    // type CoveyUser = typeof currentUser;
    Object.keys(currentUser).forEach(key => {
      switch (key) {
        case "userID":
          fields.push(
            <Flex pl="4" pr="4" pt="1" pb="1">
              <FormControl>
                <FormLabel htmlFor={key}>{key.toLocaleUpperCase()}</FormLabel>
                <Input name={key}
                  value={currentUser.userID}
                  isReadOnly={!editting}
                  variant="filled" />
              </FormControl>
            </Flex>
          )
          break;
        case "username":
          fields.push(
            <Flex pl="4" pr="4" pt="1" pb="1">
              <FormControl>
                <FormLabel htmlFor={key}>{key.toLocaleUpperCase()}</FormLabel>
                <Input name={key}
                  value={currentUser.username}
                  isReadOnly={!editting}
                  variant="filled" />
              </FormControl>
            </Flex>
          )
          break;
        case "password":
          fields.push(
            <Flex pl="4" pr="4" pt="1" pb="1">
              <FormControl>
                <FormLabel htmlFor={key}>{key.toLocaleUpperCase()}</FormLabel>
                <Input name={key}
                  value={currentUser.password}
                  isReadOnly={!editting}
                  variant="filled" />
              </FormControl>
            </Flex>
          )
          break;
        case "isPublic":
          fields.push(
            <Flex pl="4" pr="4" pt="1" pb="1">
              <FormControl>
                <FormLabel htmlFor={key}>Public</FormLabel>
                <Input name={key}
                  value={currentUser.isPublic ? "Yes" : "No"}
                  isReadOnly={!editting}
                  variant="filled" />
              </FormControl>
            </Flex>
          )
          break;
        case "email":
          fields.push(
            <Flex pl="4" pr="4" pt="1" pb="1">
              <FormControl>
                <FormLabel htmlFor={key}>{key.toLocaleUpperCase()}</FormLabel>
                <Input name={key}
                  value={currentUser.email}
                  isReadOnly={!editting}
                  variant="filled" />
              </FormControl>
            </Flex>
          )
          break;
        case "bio":
          fields.push(
            <Flex pl="4" pr="4" pt="1" pb="1">
              <FormControl>
                <FormLabel htmlFor={key}>{key.toLocaleUpperCase()}</FormLabel>
                <Input name={key}
                  value={currentUser.bio}
                  isReadOnly={!editting}
                  variant="filled" />
              </FormControl>
            </Flex>
          )
          break;
        case "hobbies":
          fields.push(
            <Flex pl="4" pr="4" pt="1" pb="1">
              <FormControl>
                <FormLabel htmlFor={key}>{key.toLocaleUpperCase()}</FormLabel>
                <Input name={key}
                  value={currentUser.hobbies}
                  isReadOnly={!editting}
                  variant="filled" />
              </FormControl>
            </Flex>
          )
          break;
        case "firstName":
          fields.push(
            <Flex pl="4" pr="4" pt="1" pb="1">
              <FormControl>
                <FormLabel htmlFor={key}>{key.toLocaleUpperCase()}</FormLabel>
                <Input name={key}
                  value={currentUser.firstName}
                  isReadOnly={!editting}
                  variant="filled" />
              </FormControl>
            </Flex>
          )
          break;
        case "lastName":
          fields.push(
            <Flex pl="4" pr="4" pt="1" pb="1">
              <FormControl>
                <FormLabel htmlFor={key}>{key.toLocaleUpperCase()}</FormLabel>
                <Input name={key}
                  value={currentUser.lastName}
                  isReadOnly={!editting}
                  variant="filled" />
              </FormControl>
            </Flex>
          )
          break;
        case "dob":
          fields.push(
            <Flex pl="4" pr="4" pt="1" pb="1">
              <FormControl>
                <FormLabel htmlFor={key}>{key.toLocaleUpperCase()}</FormLabel>
                <Input name={key}
                  value={currentUser.dob}
                  isReadOnly={!editting}
                  variant="filled" />
              </FormControl>
            </Flex>
          )
          break;
        case "relationshipStatus":
          fields.push(
            <Flex pl="4" pr="4" pt="1" pb="1">
              <FormControl>
                <FormLabel htmlFor={key}>{key.toLocaleUpperCase()}</FormLabel>
                <Input name={key}
                  value={currentUser.relationshipStatus === RelationshipStatus.Single
                    ? "Single"
                    : "Taken"}
                  isReadOnly={!editting}
                  variant="filled" />
              </FormControl>
            </Flex>
          )
          break;
        default: throw new Error("Unsupported Key in CoveyUser")
      }
    }
    );

    return fields
  }

  return (
    <>
      {
        !isAuthenticated ?
          (
            <form>
              <Stack>
                <Box borderWidth="1px" borderRadius="lg">
                  <Heading p="4" as="h2" size="lg">Please log in to use Covey.Town</Heading>
                  <Heading p="4" as="h6" size="md">
                    By clicking on the Login button in the top right of the page,
                    you will become a part of the most interactive community on
                    the entire internet!
                  </Heading>
                </Box>
              </Stack>
            </form>
          )
          :
          (
            <form>
              <Stack>
                <Box borderWidth="1px" borderRadius="lg">
                  <Heading p="4" as="h2" size="lg">Your User Profile</Heading>
                  <FormControl spacing={4}>
                    {renderPopulatedFields(coveyUser)}
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
          )
      }
    </>
  );
}
