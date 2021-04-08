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
import { searchUserByEmail, searchUserByUserName, User } from '../../graphql/queries';


function FriendsPage(): JSX.Element {
  const toast = useToast();
  const toastWindow = () => {
    toast({
            title: "Coming soon!",
            isClosable: true,
            
          })  
  }
 
  const { user } = useAuth0();
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<User[]>([]);
  const [friendListUser, setFriendListUser] = useState<User[]>([]);
  const [requestListUser, setRequestListUser] = useState<User[]>([]);

  useEffect(() => {
    const findUser = async () => {
      const userInfo = await searchUserByEmail(user.email);
      setFriends(userInfo.friends);
      setRequests(userInfo.requests);
      // when we want to click on friend and go to their profile
      setFriendListUser([...friendListUser]);
      setRequestListUser([...requestListUser]);
    };
    findUser();
  },[]);

  const handleGoToFriendPage = async (friendUser: any) => {
    // console.log(typeof (friendUser));
    const userProfile = await searchUserByUserName(friendUser);
    console.log(userProfile);

    
  };
 


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
                      {friends.map((friend) => (
                        <Box bg="white" p={5} color="black" key={user._id} borderWidth="1px" borderRadius="lg" >
                          <Flex>
                            <Button textAlign='left' onClick={() => handleGoToFriendPage(friend)}>{friend}</Button>
                              <Spacer/>
                            <Button onClick={toastWindow} textAlign='right' >Invite</Button> 
                          </Flex>
                        </Box>
                      ))}
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
                    {requests.map((request) => (
                      <Box bg="white" p={5} color="black" key={user._id} borderWidth="1px" borderRadius="lg">
                        <Flex>
                          <Text textAlign='left'>{request}</Text>
                           <Spacer />
                          <HStack spacing="24px">
                            <Button size='md' color='blue.500'> <span>&#10003;</span> </Button>
                            <Button size='md' color='blue.500'> <span>&#10005;</span> </Button>
                          </HStack>
                        </Flex>                          
                      </Box>
                      ))}
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

export default FriendsPage;




