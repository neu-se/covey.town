import React, {useEffect, useState} from 'react';
import {withRouter, useParams, Link} from "react-router-dom";
import '../Styles/Friend.css';
import {
  Flex,
  Heading,
  Box,
  Button,
  Text,
  Stack
} from '@chakra-ui/react';
import {useAuth0} from "@auth0/auth0-react";
import {searchUserByName, searchUserByEmail, addFriend} from "../../graphql/queries";


interface ParamTypes {
  users: string
}


function InviteFriendComponent() : JSX.Element {

  const { user } = useAuth0();
  const { users } = useParams<ParamTypes>()
  const [userName, setUserName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [facebookLink,setFacebookLink] = useState<string>("");
  const [instagramLink, setInstagramLink] = useState<string>("");
  const [linkedInLink, setLinkedInLink] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [occupation, setOccupation] = useState<string>("");
  const [showInvite, setShowInvite] = useState<boolean>(false)
  const [showFriendRequestSent, setShowFriendRequestSent] = useState<boolean>(false);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [showNone, setShowNone] = useState<boolean>(false);

  useEffect(() => {
    const findUser = async () => {
      const userInfo = await searchUserByName(users);
      const currentUser = await searchUserByEmail(user.email);
      setCurrentUserName(currentUser.username);
      setUserName(userInfo.username)
      setBio(userInfo.bio)
      setFacebookLink(userInfo.facebookLink)
      setInstagramLink(userInfo.instagramLink)
      setLocation(userInfo.location)
      setOccupation(userInfo.occupation)
      setLinkedInLink(userInfo.linkedInLink)
      if( userInfo.friends.includes(currentUser.username) ){
        setShowInvite(true);
      }
      if (currentUser.sentRequests.includes(userInfo.username)) {
        setShowFriendRequestSent(true);
      }
      if (currentUser.username === userInfo.username) {
        setShowNone(true);
      }
    }
    findUser();
  });

  const addFriendRequest = () => {
    addFriend({ userNameTo: userName, userNameFrom: currentUserName});
  }


  return (
    <Flex width="full" align="center" justifyContent="center">
      <Box
        p={2}
        maxWidth='500px'
        w='90vw'
        h='80vh'
        mt={50}
        class='box-profile'
      >

        <Box w='100%' h='60vh' bg='blue.500' boxShadow='lg'>
          <Heading size='md' paddingTop='20px'>
            {" "}
            <Text color='white'>{userName.toUpperCase()}</Text>
          </Heading>
          <Flex width='full' align='center' justifyContent='center'>
            <Box mt={90}>
              <Text color='white'>{userName.toUpperCase()}</Text>
              <Text color='white' >email:</Text>
              <Text color='white'>BIO: {bio}</Text>
              <Text color='white'>LinkedIn link: {linkedInLink}</Text>
              <Text color='white'>Instagram link: {instagramLink}</Text>
              <Text color='white'>facebook link: {facebookLink}</Text>
              <Text color='white'>Location: {location}</Text>
              <Text color='white'>Occupation: {occupation}</Text>
              <Link to='/friendsPage'>
                {showNone && 
                  <Button
                    variantColor='teal'
                    variant='outline'
                    disabled
                    type='submit'
                    width='full'
                    mt={4}
                    color='white'
                  >
                    Your profile
                  </Button>
                }
                { showInvite && !showNone && 
                  <Button
                    variantColor='teal'
                    variant='outline'
                    type='submit'
                    width='full'
                    mt={4}
                    color='white'
                  >
                    Invite
                  </Button>
                }
                { !showInvite && !showFriendRequestSent && !showNone &&
                <Button
                  variantColor='teal'
                  variant='outline'
                  type='submit'
                  onClick = { addFriendRequest }
                  width='full'
                  mt={4}
                  color='white'
                >
                  Add Friend
                </Button>
                }
                {showFriendRequestSent && !showNone &&
                <Button
                  variantColor='teal'
                  variant='outline'
                  disabled
                  width='full'
                  mt={4}
                  color='white'
                >
                  Friend Request sent
                </Button>

                }
              </Link>

            </Box>
          </Flex>
        </Box>


      </Box>
    </Flex>

  )
}

export default withRouter(InviteFriendComponent);
