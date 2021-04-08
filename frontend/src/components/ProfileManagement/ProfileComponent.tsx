import React , {useState, useEffect} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "../Styles/Profile.css";
import { withRouter, Link, useHistory } from "react-router-dom";
import {
  Flex,
  Box,
  Heading,
  Button,
  Text,
  Stack,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure, useToast,
} from "@chakra-ui/react";
import FriendSearch from "./FriendSearch";
import {findAllUserProfiles, searchUserByEmail, updateUser, UpdateUserRequest, User} from '../../graphql/queries';
import changePassword from "../services/auth0Services";


function ProfileComponent(): JSX.Element {

  const toast = useToast();
  const toastWindow = () => {
    toast({
      title: "Reset Password Email Sent!",
      isClosable: true,

    })
  }

  const history = useHistory();
  const { user, isLoading } = useAuth0();
  const [userName, setUserName] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [facebookLink,setFacebookLink] = useState<string>("");
  const [instagramLink, setInstagramLink] = useState<string>("");
  const [linkedInLink, setLinkedInLink] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [occupation, setOccupation] = useState<string>("");
  const [bio1, setBio1] = useState<string>("");
  const [facebookLink1,setFacebookLink1] = useState<string>("");
  const [instagramLink1, setInstagramLink1] = useState<string>("");
  const [linkedInLink1, setLinkedInLink1] = useState<string>("");
  const [location1, setLocation1] = useState<string>("");
  const [occupation1, setOccupation1] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    const findUser = async () => {
      const userInfo = await searchUserByEmail(user.email);
      setUserName(userInfo.username);
      setBio(userInfo.bio);
      setId(userInfo.id);
      setFacebookLink(userInfo.facebookLink);
      setInstagramLink(userInfo.instagramLink);
      setLinkedInLink(userInfo.linkedInLink);
      setLocation(userInfo.location);
      setOccupation(userInfo.occupation);
      setFacebookLink1(userInfo.facebookLink);
      setInstagramLink1(userInfo.instagramLink);
      setLinkedInLink1(userInfo.linkedInLink);
      setLocation1(userInfo.location);
      setOccupation1(userInfo.occupation);
      setBio1(userInfo.bio);


    }
    const findAllUsers = async () => {
      const userProfiles = await findAllUserProfiles();
      setUsers([...userProfiles]);
    }
    findUser();
    findAllUsers();
  },[]);

  const updateUserCall = async () => {

      const ids = id;
      console.log(occupation1)
    const findUser = async () => {
      const userInfo = await searchUserByEmail(user.email);
      setUserName(userInfo.username);
      setBio(userInfo.bio);
      setId(userInfo.id);
      setFacebookLink(userInfo.facebookLink);
      setInstagramLink(userInfo.instagramLink);
      setLinkedInLink(userInfo.linkedInLink);
      setLocation(userInfo.location);
      setOccupation(userInfo.occupation);
    }
      const payload : UpdateUserRequest =
          { id: ids, userName: user.name, bio : bio1,
          email: user.email, facebookLink: facebookLink1,
          linkedInLink: linkedInLink1, instagramLink: instagramLink1,
          location: location1, occupation: occupation1, password: user.password}

          const userInfo =  await updateUser(payload);
      findUser();

  }

  if (isLoading) {
    return <div> Loading... </div>
  }

  return (
    <Flex width='full' align='center' justifyContent='center'>
      <Box
        p={2}
        maxWidth='2000px'
        w='90vw'
        h='80vh'
        mt={50}
        class='box-profile'
      >
        <Stack direction={["column", "row"]} spacing='0px'>
          <Box w='35%' h='69vh' bg='blue.500' boxShadow='lg'>
            <Heading size='md' paddingTop='20px'>
              {" "}
              <Text color='white'>HELLO {userName.toUpperCase()}</Text>
            </Heading>
            <Flex width='full' align='center' justifyContent='center'>
              <Box mt={90}>
                <Text color='white'>{userName.toUpperCase()}</Text>
                <Text color='white'>email: {user.email}</Text>
                <Text color='white'>BIO: {bio}</Text>
                <Text color='white'>LinkedIn link: {linkedInLink}</Text>
                <Text color='white'>Instagram link: {instagramLink}</Text>
                <Text color='white'>facebook link: {facebookLink}</Text>
                <Text color='white'>Location: {location}</Text>
                <Text color='white'>Occupation: {occupation}</Text>
                <Link to='/friendsPage'>
                  {" "}
                  <Button
                    variantColor='teal'
                    variant='outline'
                    type='submit'
                    width='full'
                    mt={4}
                    color='white'
                  >
                    Friends
                  </Button>
                </Link>
                <Button
                  variantColor='teal'
                  variant='outline'
                  type='submit'
                  width='full'
                  mt={4}
                  color='white'
                  onClick={onOpen}
                >
                  Edit Profile

                </Button>
                <Button
                  variantColor='teal'
                  variant='outline'
                  type='submit'
                  width='full'
                  mt={4}
                  color='white'
                  onClick={()=>{
                    changePassword(user.email).then(r=>{
                        toastWindow();
                      })}}
                >
                  Change Password
                </Button>
                <Modal
                  isOpen={isOpen}
                  onClose={onClose}
                >
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Update your account</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                      <FormControl>
                        <FormLabel>Username</FormLabel>
                        <Input isReadOnly placeholder="Name" value={userName}
                               onChange={event => setUserName(event.target.value)} />
                      </FormControl>

                      <FormControl mt={4}>
                        <FormLabel>Occupation</FormLabel>
                        <Input placeholder="Occupation" value={occupation1 || ''}
                               onChange={(event) => {
                                 console.log(event.target.value)
                                 setOccupation1(event.target.value)}
                               } />
                      </FormControl>
                      <FormControl mt={4}>
                        <FormLabel>Bio</FormLabel>
                        <Input placeholder="Bio" value={bio1}
                               onChange={event => setBio1(event.target.value)} />
                      </FormControl>
                      <FormControl mt={4}>
                        <FormLabel>Location</FormLabel>
                        <Input placeholder="Location" value={location1}
                               onChange={event => setLocation1(event.target.value)} />
                      </FormControl>
                      <FormControl mt={4}>
                        <FormLabel>Linkedin Link</FormLabel>
                        <Input placeholder="Linkedin Link" value={linkedInLink1}
                               onChange={event => setLinkedInLink1(event.target.value)} />
                      </FormControl>
                      <FormControl mt={4}>
                        <FormLabel>Instagram Link</FormLabel>
                        <Input placeholder="Instagram Link" value={instagramLink1}
                               onChange={event => setInstagramLink1(event.target.value)} />
                      </FormControl>
                      <FormControl mt={4}>
                        <FormLabel>Facebook Link</FormLabel>
                        <Input placeholder="Facebook Link"  value={facebookLink1}
                               onChange={event => setFacebookLink1(event.target.value)} />
                      </FormControl>
                    </ModalBody>

                    <ModalFooter>
                      <Button colorScheme="blue" mr={3} onClick={()=>{
                        updateUserCall().then(r=>r);
                        onClose();
                      }}>
                        Update
                      </Button>
                      <Button onClick={onClose}>Delete</Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </Box>
            </Flex>
          </Box>
          <Box w='65%' h='60vh' bg='white'>
            <Flex width='full' align='center' justifyContent='center'>
              <Box mt={5}>
                <FriendSearch />
                <Divider orientation='horizontal' w='50vw' />
                <Box w='100%'>
                  <Text className='bold-text' color='blue.500' fontSize="lg"> Covey Town Users </Text>
                  <Box h='50vh' bg='gray.100' boxShadow='lg' overflowY='auto'>
                    <Flex align='center' justifyContent='center'>
                      <Box mt={5} w='90%'>
                        {users.map((userProfile) => (
                          <Box bg="white" p={5} color="black" key={userProfile.id} borderWidth="1px" borderRadius="lg" alignItems="center">
                            <Flex>
                              <Button size='md'alignItems="center" onClick={()=>{history.push(`/users/${userProfile.username}`);}}>
                                <Text textAlign='center'>{userProfile.username}</Text>
                              </Button>
                              <Spacer/>
                            </Flex>
                          </Box>
                        ))}
                      </Box>
                    </Flex>
                  </Box>
                </Box>
              </Box>
            </Flex>
          </Box>
        </Stack>
      </Box>
    </Flex>
  );
}

export default withRouter(ProfileComponent);
