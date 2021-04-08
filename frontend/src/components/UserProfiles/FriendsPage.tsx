import React , {useState, useEffect} from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Text,
  Flex,
  Button,
  Divider,
  Stack,
  HStack,
  Spacer,
  useToast,
  Link
} from "@chakra-ui/react"
import { useHistory, withRouter } from "react-router-dom";
import {
  acceptFriend,
  AcceptFriendRequest, rejectFriend,
  RejectFriendRequest,
  searchUserByEmail,
  searchUserByUserName,
} from '../../graphql/queries';



function FriendsPage(): JSX.Element {

  const history = useHistory();

  const toast = useToast();
  const toastWindow = () => {
    toast({
      title: "Coming soon!",
      isClosable: true,

    })
  }

  const { user } = useAuth0();
  const [friends, setFriends] = useState<string[]>([]);
  const [requests, setRequests] = useState<string[]>([]);
  const [userName, setUserName] =  useState<string>("");

  const acceptFriendRequest = async (userFrom : string) => {
    const acceptPayload : AcceptFriendRequest = { userNameFrom: userFrom, userNameTo: userName };
    await acceptFriend(acceptPayload);
    const findUser = async () => {
      const userInfo = await searchUserByEmail(user.email);
      setFriends(userInfo.friends);
      setRequests(userInfo.requests);
      setUserName(userInfo.username);
    };
    findUser()
  }

  const rejectFriendRequest = async (userFrom : string) => {
    const acceptPayload : RejectFriendRequest = { userNameFrom: userFrom, userNameTo: userName };
    await rejectFriend(acceptPayload);
    const findUser = async () => {
      const userInfo = await searchUserByEmail(user.email);
      setFriends(userInfo.friends);
      setRequests(userInfo.requests);
      setUserName(userInfo.username);
    };
    findUser()
  }

  useEffect(() => {
    const findUser = async () => {
      const userInfo = await searchUserByEmail(user.email);
      setFriends(userInfo.friends);
      setRequests(userInfo.requests);
      setUserName(userInfo.username);
    };
    findUser();
  },[user.email]);


  return (
    <>
      <Flex width='full' align='center' justifyContent='center'>
        <Box
          p={2}
          w='90vw'
          h='80vh'
          mt={50}
          paddingLeft="10%"
        >
          <Stack direction={["column", "row"]} spacing='10px' >
            <Box w='40%'>
              <Text className='bold-text' color='blue.500' fontSize="5xl"> Friend List</Text>
              <Box h='60vh' bg='gray.100' boxShadow='lg' overflowY='auto'>
                <Flex align='center' justifyContent='center'>
                  <Box mt={5} w='90%'>
                    {friends.length !== 0 && friends.map((friend) => (
                      <Box bg="white" p={5} color="black" key={user._id} borderWidth="1px" borderRadius="lg" >
                        <Flex>
                          <Button textAlign='left' onClick={()=>{history.push(`/users/${friend}`);}}>{friend}</Button>
                          <Spacer/>
                          <Button onClick={toastWindow} textAlign='right' >Invite</Button>
                        </Flex>
                      </Box>
                    ))}
                      { friends.length === 0 &&
                          <Box bg="white" p={5} color="black" key={user._id} borderWidth="1px" borderRadius="lg">
                            <Text>You have no friends.</Text>
                          </Box>
                      }
                  </Box>
                </Flex>
              </Box>
            </Box>

            <Box w='35%' marginLeft="10% !important" right="0">
              <Text className='bold-text' color='blue.500' fontSize="5xl"> Friend Requests</Text>
              <Box h='60vh' boxShadow='lg' overflowY="auto">
                <Flex align='center' justifyContent='center' >
                  <Box mt={5} w='90%'>
                    <Divider orientation='horizontal'/>
                    <Stack>
                      {requests.length !== 0 && requests.map((request) => (
                        <Box bg="white" p={5} color="black" key={user._id} borderWidth="1px" borderRadius="lg">
                          <Flex>
                            <Text textAlign='left' onClick={()=>{history.push(`/users/${request}`);}}>{request}</Text>
                            <Spacer />
                            <HStack spacing="24px">
                              <Button size='md' color='blue.500' onClick={()=>{acceptFriendRequest(request).then(r=>r)}}> <span>&#10003;</span> </Button>
                              <Button size='md' color='blue.500' onClick={()=>{rejectFriendRequest(request).then(r=>r)}}> <span>&#10005;</span> </Button>
                            </HStack>
                          </Flex>
                        </Box>
                      ))}
                      { requests.length === 0 &&
                      <Box bg="white" p={5} color="black" key={user._id} borderWidth="1px" borderRadius="lg">
                        <Text>You have no friend requests</Text>
                      </Box>
                      }
                    </Stack>
                  </Box>
                </Flex>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Flex>
    </>
  );
};

export default withRouter(FriendsPage);
