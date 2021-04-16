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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
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


interface TownSelectionProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>,
  test: boolean,
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

interface DeleteUserByIdBody {
  userId: string,
}

interface UpdateUserBody {
  bio: string,
  dob: string,
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
  user: AuthUser
}

const TownSelection = ({ doLogin, test }: TownSelectionProps): JSX.Element => {
  const toast = useToast();
  const { isAuthenticated, user, logout } = useAuth0();
  const [newTownName, setNewTownName] = useState<string>('');
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [townIDToJoin, setTownIDToJoin] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<CoveyTownInfo[]>();
  const { connect } = useVideoContext();
  const { apiClient } = useCoveyAppState();
  const [editting, setEditting] = useState<boolean>(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState<boolean>(false);

  // user fields that cant be editted
  const [userName, setUserName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [dob, setDob] = useState<string>('');

  // editable fields
  const [bio, setBio] = useState<string>('');
  const [located, setLocated] = useState<string>('');
  const [hobbies, setHobbies] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [relationshipStatus, setRelationshipStatus] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const hasuraUrl = process.env.REACT_APP_HASURA_USER;
  const secret = process.env.REACT_APP_HASURA_SECRET;

  const updateUser = () => {
    // build the user object
    const req: UpdateUserBody = {
      bio,
      dob,
      hobbies,
      relationship_status: relationshipStatus,
      located,
      gender,
      is_public: isPublic,
      userId: user.sub
    }

    // send the user object to patch
    // const updateUrl = "https://coveytown-g39.hasura.app/api/rest/user/userId";
    if (hasuraUrl === undefined || secret === undefined) {
      return;
    }
    fetch(`${hasuraUrl}/userId`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": secret
      },
      body: JSON.stringify(req),
    })
      .then((res) => res.json())
      .then((obj) => {
        if (obj.update_CoveyTown_user_profile.affected_rows > 0) {
          toast({
            title: "Update Profile",
            description: "Successfully updated your profile",
            status: "success",
            duration: 9000,
            isClosable: true,
          })
        }
        else {
          toast({
            title: "Update Profile",
            description: "Failed to update your profile",
            status: "error",
            duration: 9000,
            isClosable: true,
          })
        }
      })
      .then(() => setEditting(false))
      .catch((err) => {
        toast({
          title: "Update Profile",
          description: `Failed to update your profile: ${err}`,
          status: "error",
          duration: 9000,
          isClosable: true,
        })
      })
  }

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

  useEffect(() => {
    if (user) {
      console.log(hasuraUrl, secret)
      if (hasuraUrl === undefined || secret === undefined) {
        return;
      }
      const data: GetUserByIdBody = {
        userId: user.sub
      }
      fetch(`${hasuraUrl}/userId`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret": secret
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
            const req: CreateUserRequest = {
              bio: '',
              dob: '',
              is_public: true,
              located: '',
              hobbies: '',
              gender: '',
              relationship_status: '',
              user_id: user.sub
            }
            if (hasuraUrl === undefined || secret === undefined) {
              return;
            }
            fetch(hasuraUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-hasura-admin-secret": secret
              },
              body: JSON.stringify(req),
            })
              .then(res => res.json())
              .then(objData => {
                const userData = objData.insert_CoveyTown_user_profile.returning[0];
                setUser(userData);
              })
              .catch(err => {
                toast({
                  title: "Create Account",
                  description: `Failed to create your account: ${err}`,
                  status: "error",
                  duration: 9000,
                  isClosable: true,
                })
              })
          }
        })
        .catch((err) => {
          toast({
            title: "Get User Information",
            description: `Failed to get user by id: ${err}`,
            status: "error",
            duration: 9000,
            isClosable: true,
          })
        })
    }
  }, [user, toast, hasuraUrl, secret])

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
          {
            test ?
              (
                <Input name="username"
                  value={userName}
                  onChange={(event) => setUserName(event.target.value)}
                  variant="filled" />
              ) : (
                <Input name="username"
                  value={userName}
                  isDisabled={editting}
                  isReadOnly
                  variant="filled" />
              )
          }
        </FormControl>
      </Flex>
    )

    // dob
    fields.push(
      <Flex pl="4" pr="4" pt="1" pb="1">
        <FormControl>
          <FormLabel htmlFor="dob">Date Of Birth</FormLabel>
          <Input name="dob"
            value={dob}
            isReadOnly={!editting}
            onChange={(event) => setDob(event.target.value)}
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
            isDisabled={editting}
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
            onChange={(event) => setBio(event.target.value)}
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
            onChange={(event) => setHobbies(event.target.value)}
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
            onChange={(event) => setRelationshipStatus(event.target.value)}
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
            onChange={(event) => setLocated(event.target.value)}
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
            onChange={(event) => setGender(event.target.value)}
            variant="filled" />
        </FormControl>
      </Flex>
    )

    // isPublic - e
    fields.push(
      <Flex pl="4" pr="4" pt="1" pb="1">
        <FormControl>
          <FormLabel htmlFor="isPublic">Make Profile Public?</FormLabel>
          <Checkbox name="isPublic"
            isChecked={isPublic}
            isReadOnly={!editting}
            onChange={(event) => setIsPublic(event.target.checked)}
            variant="filled" />
        </FormControl>
      </Flex>
    )

    return fields
  }

  const deleteUser = () => {
    const req: DeleteUserByIdBody = {
      userId: user.sub
    }
    if (hasuraUrl === undefined || secret === undefined) {
      return;
    }
    fetch(hasuraUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": secret
      },
      body: JSON.stringify(req),
    })
      .then(res => res.json())
      .then(obj => {
        if (obj.delete_CoveyTown_user_profile.affected_rows === 1
          && obj.delete_CoveyTown_users.affected_rows === 1) {
          toast({
            title: "Delete Account",
            description: "Successfully deleted your account. You will be redirected in 3 seconds..",
            status: "warning",
            duration: 9000,
            isClosable: true,

          })
          setTimeout(() => logout({ returnTo: window.location.origin }), 3000);
        }
        else {
          toast({
            title: "Delete Account",
            description: "Failed to delete your account",
            status: "error",
            duration: 9000,
            isClosable: true,
          })
        }
      })
      .catch((err) => {
        toast({
          title: "Delete Account",
          description: `Failed to delete your account: ${err}`,
          status: "error",
          duration: 9000,
          isClosable: true,
        })
      })
  }

  return (
    <>
      {
        !isAuthenticated && !test ?
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
                    <Button ml={3} onClick={() => setOpenDeleteConfirmation(true)}
                      style={{ float: "right" }}
                      colorScheme="red">
                      Delete
                    </Button>
                    {
                      editting ?
                        <Button
                          style={{ float: "right" }}
                          colorScheme="blue"
                          onClick={() => updateUser()}>Save</Button>
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
              <Modal
                isCentered
                onClose={() => setOpenDeleteConfirmation(false)}
                isOpen={openDeleteConfirmation}
                motionPreset="slideInBottom"
                size="sm"
              >
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Account Delete Confirmation</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    Are you sure you want to delete your Covey Town account?
                    You will be leaving the literal best community on the planet.
                    We will send you bitcoin if you stay!
                 </ModalBody>
                  <ModalFooter>
                    <Button mr={3} variant="ghost"
                      onClick={() => setOpenDeleteConfirmation(false)}>
                      Cancel
                    </Button>
                    <Button colorScheme="red" variant="ghost"
                      onClick={() => deleteUser()}>
                      Delete
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </form>
          )
      }
    </>
  );
}

export default TownSelection
