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
import { EditIcon } from '@chakra-ui/icons'
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

interface CreateUserRequest {
  bio: string,
  dob: string,
  is_public: boolean,
  located: string,
  hobbies: string,
  gender: string,
  relationship_status: string,
  user_id: string
}

interface CreateUserResponse {
  bio: string,
  dob: string,
  is_public: boolean,
  located: string,
  hobbies: string,
  gender: string,
  relationship_status: string,
  created_at: string,
  updated_at: string,
  user: AuthUser
}

interface AuthUser {
  email: string,
  name: string,
  picture: string,
}

interface GetUserByIdBody {
  userId: string,
}

interface UpdateUserBody {
  bio: string,
  gender: string,
  hobbies: string,
  is_public: boolean,
  located: string,
  relationship_status: string,
  userId: string,
}

interface GetUserByIdResponse {
  bio: string,
  dob: string,
  is_public: boolean,
  located: string,
  hobbies: string,
  gender: string,
  relationship_status: string,
  created_at: string,
  updated_at: string,
  id: any, // ignore
  user: AuthUser
}

export default function TownSelection({ doLogin }: TownSelectionProps): JSX.Element {
  const toast = useToast();
  const { isAuthenticated, user } = useAuth0();
  const [newTownName, setNewTownName] = useState<string>('');
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [townIDToJoin, setTownIDToJoin] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<CoveyTownInfo[]>();
  const { connect } = useVideoContext();
  const { apiClient } = useCoveyAppState();
  const [editting, setEditting] = useState<boolean>(false);

  // user fields that cant be editted
  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>(''); // not used right now
  const [email, setEmail] = useState<string>('');
  const [dob, setDob] = useState<string>('');

  // editable fields
  const [bio, setBio] = useState<string>('');
  const [located, setLocated] = useState<string>('');
  const [hobbies, setHobbies] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [relationshipStatus, setRelationshipStatus] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);

  const setUser = (userData: CreateUserResponse | GetUserByIdResponse) => {
    setBio(userData.bio);
    setDob(userData.dob);
    setGender(userData.gender);
    setHobbies(userData.hobbies);
    setIsPublic(userData.is_public);
    setLocated(userData.located);
    setRelationshipStatus(userData.relationship_status);
    setUserName(userData.user.name);
    setEmail(userData.user.email);
  }

  const createNewUser = async (req: CreateUserRequest) => {
    const createUserUrl = "https://coveytown-g39.hasura.app/api/rest/user"; 
    fetch(createUserUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": "YElV9O3QzdoLBLnB3DYk2RBuggi7Tn1DiOEqBKOdwbCZRlaA6yMHyuyZy6Vlj3av"
      },
      body: JSON.stringify(req),
    })
      .then(res => res.json())
      .then(obj => {
        const userData = obj.insert_CoveyTown_user_profile.returning[0];
        setUser(userData);
      })
      .catch(err => console.log(err))
  }

  const fetchUserInformation = () => {
    const getUserUrl = "https://coveytown-g39.hasura.app/api/rest/user/userId"; 
    const data: GetUserByIdBody = {
      userId: user.sub
    }
    fetch(getUserUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": "YElV9O3QzdoLBLnB3DYk2RBuggi7Tn1DiOEqBKOdwbCZRlaA6yMHyuyZy6Vlj3av"
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((obj) => {
        if (obj.CoveyTown_user_profile.length === 1) { // user exists
          const userData = obj.CoveyTown_user_profile[0];
          setUser(userData);
        }
        else { // make a new user
          const date = new Date();
          const req: CreateUserRequest = {
            bio: '',
            dob: date.toISOString(),
            is_public: true,
            located: '',
            hobbies: '',
            gender: '',
            relationship_status: '',
            user_id: user.sub
          }
          createNewUser(req)
        }
      })
      .catch((err) => { // there exists no user, so create one and populate
        console.log(err)
      })
  }

  useEffect(() => {
    if (user) {
      fetchUserInformation();
    }
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

  const renderPopulatedFields = () => {
    const fields: JSX.Element[] = [];

    // username
    fields.push(
      <Flex pl="4" pr="4" pt="1" pb="1">
        <FormControl>
          <FormLabel htmlFor="username">Username</FormLabel>
          <Input name="username"
            value={userName}
            isReadOnly
            variant="filled" />
        </FormControl>
      </Flex>
    )

    // password
    fields.push(
      <Flex pl="4" pr="4" pt="1" pb="1">
        <FormControl>
          <FormLabel htmlFor="dob">Date Of Birth</FormLabel>
          <Input name="dob"
            value={dob}
            isReadOnly
            variant="filled" />
        </FormControl>
      </Flex>
    )

    // email
    fields.push(
      <Flex pl="4" pr="4" pt="1" pb="1">
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input name="email"
            value={email}
            isReadOnly
            variant="filled" />
        </FormControl>
      </Flex>
    )

    // bio - e
    fields.push(
      <Flex pl="4" pr="4" pt="1" pb="1">
        <FormControl>
          <FormLabel htmlFor="bio">Biography</FormLabel>
          <Input name="bio"
            value={bio}
            isReadOnly={!editting}
            variant="filled" />
        </FormControl>
      </Flex>
    )

    // hobbies - e
    fields.push(
      <Flex pl="4" pr="4" pt="1" pb="1">
        <FormControl>
          <FormLabel htmlFor="hobbies">Hobbies</FormLabel>
          <Input name="hobbies"
            value={hobbies}
            isReadOnly={!editting}
            variant="filled" />
        </FormControl>
      </Flex>
    )

    // relationshipStatus - e
    fields.push(
      <Flex pl="4" pr="4" pt="1" pb="1">
        <FormControl>
          <FormLabel htmlFor="rel">Relationship Status</FormLabel>
          <Input name="rel"
            value={relationshipStatus}
            isReadOnly={!editting}
            variant="filled" />
        </FormControl>
      </Flex>
    )

    // located - e
    fields.push(
      <Flex pl="4" pr="4" pt="1" pb="1">
        <FormControl>
          <FormLabel htmlFor="loc">Located</FormLabel>
          <Input name="loc"
            value={located}
            isReadOnly={!editting}
            variant="filled" />
        </FormControl>
      </Flex>
    )

    // gender - e
    fields.push(
      <Flex pl="4" pr="4" pt="1" pb="1">
        <FormControl>
          <FormLabel htmlFor="gen">Gender</FormLabel>
          <Input name="gen"
            value={gender}
            isReadOnly={!editting}
            variant="filled" />
        </FormControl>
      </Flex>
    )

    // isPublic - e
    fields.push(
      <Flex pl="4" pr="4" pt="1" pb="1">
        <FormControl>
          <FormLabel htmlFor="isPublic">Public</FormLabel>
          <Input name="isPublic"
            value={isPublic ? "Yes" : "No"}
            isReadOnly={!editting}
            variant="filled" />
        </FormControl>
      </Flex>
    )

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
                  <Heading p="4" as="h2" size="lg">
                    Your User Profile
                    {
                      editting ?
                        <Button
                          style={{ float: "right" }}
                          colorScheme="blue"
                          onClick={() => setEditting(false)}>Save</Button>
                        :
                        <Button
                          style={{ float: "right" }}
                          colorScheme="green"
                          onClick={() => setEditting(true)}>Edit</Button>
                    }
                  </Heading>
                  <FormControl spacing={4}>
                    {renderPopulatedFields()}
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
