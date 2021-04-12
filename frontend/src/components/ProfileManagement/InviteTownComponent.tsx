import React, { useEffect, useState,useCallback } from "react";
import assert from "assert";
import { Box, Image, Heading, Flex, Stack, Button, Text, Spacer, Divider, HStack, useToast } from "@chakra-ui/react";
import { useAuth0 } from "@auth0/auth0-react";
import { searchUserByName, searchUserByEmail } from "../../graphql/queries";
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import Video from '../../classes/Video/Video';
import { TownJoinResponse, } from '../../classes/TownsServiceClient';

interface TownSelectionProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}

export default function InviteTownComponent({ doLogin }: TownSelectionProps): JSX.Element {
  const { user } = useAuth0();
  const [requests, setRequests] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [coveyRoomIDSent, setCoveyRoomIDSent] = useState<string>("");
  const toast = useToast();
  const { connect } = useVideoContext();
  useEffect(() => {
    const findUser = async () => {
      const userInfo = await searchUserByEmail(user.email);
      setRequests(userInfo.requests);
      setUserName(userInfo.username);
    };
    findUser();
  }, [user.email]);
  const handleJoin = useCallback(async (coveyRoomID: string) => {
    try {
      if (!userName || userName.length === 0) {
        toast({
          title: 'Unable to join town',
          description: 'Please update your username in user profile',
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

  const acceptInviteRequest = async (request : string) => {
    await handleJoin(request);
  }
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
            <Box w='35%' marginLeft="10% !important" right="0">
              <Text className='bold-text' color='blue.500' fontSize="5xl"> Invite Requests</Text>
              <Box h='60vh' boxShadow='lg' overflowY="auto">
                <Flex align='center' justifyContent='center' >
                  <Box mt={5} w='90%'>
                    <Divider orientation='horizontal'/>
                    <Stack>
                      {requests.length !== 0 && requests.map((request) => (
                        <Box bg="white" p={5} color="black" key={user._id} borderWidth="1px" borderRadius="lg">
                          <Flex>
                            <Spacer />
                            <HStack spacing="24px">
                              <Button size='md' color='blue.500' onClick={()=>{acceptInviteRequest(request).then(r=>r)}}> <span>&#10003;</span> </Button>
                            </HStack>
                          </Flex>
                        </Box>
                      ))}
                      { requests.length === 0 &&
                      <Box bg="white" p={5} color="black" key={user._id} borderWidth="1px" borderRadius="lg">
                        <Text>You have no Invite town requests</Text>
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
}
