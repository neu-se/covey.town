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
  useDisclosure,
} from "@chakra-ui/react";
import FriendSearch from "./FriendSearch";
import {findAllUserProfiles, searchUserByEmail, updateUser, UpdateUserRequest, User} from '../../graphql/queries';


function ProfileComponent(): JSX.Element {
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


    }
    const findAllUsers = async () => {
      const userProfiles = await findAllUserProfiles();
      setUsers([...userProfiles]);
    }
    findUser();
    findAllUsers();
  });

  const updateUserCall = async () => {

      const ids = id;
      // console.log(occupation1)

      const payload : UpdateUserRequest =
          { id: ids, userName: user.name, bio,
          email: user.email, facebookLink,
          linkedInLink, instagramLink,
         location, occupation, password: user.password}


          const userInfo =  await updateUser(payload);



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
          <Box w='35%' h='60vh' bg='blue.500' boxShadow='lg'>
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
                        <Input placeholder="Occupation" value={occupation}
                               onChange={(event) => {
                                 console.log(event.target.value)
                                 setOccupation(event.target.value)}
                               } />
                      </FormControl>
                      <FormControl mt={4}>
                        <FormLabel>Bio</FormLabel>
                        <Input placeholder="Bio" value={bio}
                               onChange={event => setBio(event.target.value)} />
                      </FormControl>
                      <FormControl mt={4}>
                        <FormLabel>Location</FormLabel>
                        <Input placeholder="Location" value={location}
                               onChange={event => setLocation(event.target.value)} />
                      </FormControl>
                      <FormControl mt={4}>
                        <FormLabel>Linkedin Link</FormLabel>
                        <Input placeholder="Linkedin Link" value={linkedInLink}
                               onChange={event => setLinkedInLink(event.target.value)} />
                      </FormControl>
                      <FormControl mt={4}>
                        <FormLabel>Instagram Link</FormLabel>
                        <Input placeholder="Instagram Link" value={instagramLink}
                               onChange={event => setInstagramLink(event.target.value)} />
                      </FormControl>
                      <FormControl mt={4}>
                        <FormLabel>Facebook Link</FormLabel>
                        <Input placeholder="Facebook Link"  value={facebookLink}
                               onChange={event => setFacebookLink(event.target.value)} />
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
