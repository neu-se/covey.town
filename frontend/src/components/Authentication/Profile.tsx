import React, { useCallback, useEffect, useState } from 'react';
import assert from "assert";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,  
  Image,
  Input,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast
} from '@chakra-ui/react';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { useAuth0 } from "@auth0/auth0-react";
import { makeStyles, } from '@material-ui/core';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import Video from '../../classes/Video/Video';
import { CoveySavedTownInfo, TownJoinResponse, } from '../../classes/TownsServiceClient';
import IntroContainer from '../VideoCall/VideoFrontend/components/IntroContainer/IntroContainer';
import BackHomeButton from './BackHomeButton';
import useCoveyAppState from '../../hooks/useCoveyAppState';

const useStyles = makeStyles(() => ({
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: '30px',
  },

  bodyDiv: {
    backgroundColor: '#87ceff',
    height: '100vh',
  }
}));

interface ProfileProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}

export default function Profile({ doLogin }: ProfileProps): JSX.Element {
  
  const { user, logout } = useAuth0();
  const { apiClient } = useCoveyAppState();

  const [ email, setEmail ] = useState<string>('');
  const [ firstName, setFirstName ] = useState<string>('');
  const [ lastName, setLastName ] = useState<string>('');

  const [ currentAvatarPreview, setCurrentAvatarPreview ] = useState<string>('');
  const { buttonContainer, bodyDiv } = useStyles();

  const [ avatarPreview, setAvatarPreview ] = useState<string>('aang');
  const [userName] = useState<string>(user.given_name  || user.nickname);
  const { connect } = useVideoContext();

  const [savedTowns, setSavedTowns] = useState<CoveySavedTownInfo[]>();
  const toast = useToast();

  const [isOpen, setIsOpen] = React.useState(false)
  const onClose = () => setIsOpen(false)
  const cancelRef = React.useRef() as React.MutableRefObject<HTMLButtonElement>;

  const getAllUserInfo = useCallback( () => {
    apiClient.getUserInfo({email: user.email})
      .then((userInfo) => {
        setEmail(userInfo.email);
        setFirstName(userInfo.firstName || '');
        setLastName(userInfo.lastName || '');
        setCurrentAvatarPreview(userInfo.currentAvatar);
      })
      .catch((err) => {
          toast({
            title: 'Unable to get User info',
            description: err.toString(),
            status: 'error'
          })
      }) 

  }, [apiClient, toast, user.email]);  
  
  const updateSavedTownListings = useCallback(() => {
    if (user) {

      apiClient.listSavedTowns({email: user.email})
        .then((towns) => {
          setSavedTowns(towns.towns
            .sort((a, b) => b.currentOccupancy - a.currentOccupancy)
          );
        })
        .catch((err) => {
          toast({
            title: 'Unable to get Saved Towns',
            description: err.toString(),
            status: 'error'
          })
      }) 
    }
  }, [apiClient, toast, user])

  useEffect(() => {
   getAllUserInfo();
   updateSavedTownListings(); 
  }, [getAllUserInfo, updateSavedTownListings]);


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
  
  const handleUnsave = useCallback(async (coveyTownID: string) => {
    try {
      await apiClient.deleteSavedTown({
        email,
        townID: coveyTownID
      });
      toast({
        title: 'Removed Town from Saved Towns List!',
        status: 'success'
      });
      updateSavedTownListings();
    } catch (err) {
      toast({
        title: 'Unable to unsave town',
        description: err.toString(),
        status: 'error'
      })
    }
  }, [apiClient, email, toast, updateSavedTownListings]);

  const processUpdates = async (action: string) =>{
    switch (action) {
      case 'edit':
        try {
          await apiClient.updateUser({
            email,
            firstName,
            lastName,
          });
          toast({
            title: 'User Information updated',
            status: 'success'
          });
  
        } catch(err) {
          toast({
            title: 'Unable to update info',
            description: err.toString(),
            status: 'error'
          });
        }   
        break;
      case 'avatar':  
        try {
          await apiClient.updateUserAvatar({
            email,
            avatar: avatarPreview,
          });
          toast({
            title: 'User Avatar updated',
            status: 'success'
          });
          setCurrentAvatarPreview(avatarPreview);
        } catch(err) {
          toast({
            title: 'Unable to update avatar',
            description: err.toString(),
            status: 'error'
          }); 
        }
        break;
      case 'delete':  
      try {
        await apiClient.deleteUser({
          email,
        });
        toast({
          title: 'User Account deleted',
          status: 'success'
        });
        logout({ returnTo: window.location.origin });
      } catch(err) {
        toast({
          title: 'Unable to delete account',
          description: err.toString(),
          status: 'error'
        }); 
      }
        break;
      default:
        break;
    }
  };
  
  return (
    <div className={bodyDiv}>
    <IntroContainer>
            <div className={buttonContainer}>
        <BackHomeButton />
      </div>
      <Stack>
        <Center h="50px">
          <Heading as="h1" size="lg">Profile Page</Heading>
        </Center>   
        <Box p="4" borderWidth="1px" borderRadius="lg">
          <Center>
            <Heading as="h2" size="md">User Infomation</Heading>
          </Center>
          <Box p="4" borderWidth="1px" borderRadius="lg">
            <form onSubmit={(ev)=>{ev.preventDefault(); processUpdates('edit')}}>
              <Stack>
                <Input id='email' name="email" value={email} disabled />
                <Stack align='center' direction='row'>
                  <FormControl>
                    <FormLabel htmlFor='firstName'>First Name</FormLabel>
                    <Input id='firstName' placeholder="Enter First Name" name="firstName" value={firstName} onChange={(ev)=>setFirstName(ev.target.value)} />
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor='lastName'>Last Name</FormLabel>
                    <Input id='lastName' placeholder="Last Name" name="lastName" value={lastName} onChange={(ev)=>setLastName(ev.target.value)} />
                  </FormControl>
                  <Button data-testid='updatebutton' colorScheme="blue" value="update" name='action2' onClick={()=>processUpdates('edit')}>
                  Update
                  </Button>
                </Stack>
              </Stack>  
            </form>
          </Box>
          
        </Box> 
        <Box p="4" borderWidth="1px" borderRadius="lg">
          <Center>
            <Heading as="h2" size="md">Current User Avatar</Heading>
          </Center>   
        
          <Center>
            <Image
              boxSize="100px"
              objectFit="contain"
              src={`${process.env.PUBLIC_URL}/assets/atlas/tuxemon-${currentAvatarPreview}/${currentAvatarPreview}-front.png`}
            />
          </Center>
        </Box>
        <Box p="4" borderWidth="1px" borderRadius="lg">
          <Stack align='center' direction="row">
            <BsFillInfoCircleFill/> <Text fontSize="lg">To change the current Avatar, select one from the Dropdown Menu </Text>
          </Stack>
          <Center>
            <Heading as="h2" size="sm">Selection Preview</Heading>
          </Center>   
        
          <Center>
            <Image
              key={Date.now()}
              boxSize="100px"
              objectFit="contain"
              src={`${process.env.PUBLIC_URL}/assets/atlas/tuxemon-${avatarPreview}/${avatarPreview}-front.png`}
            />
          </Center>
        </Box>
        <Stack direction="row">
          <Select variant="filled" onChange={(ev)=>setAvatarPreview(ev.target.value)}>
            <option value="aang">Aang</option>
            <option value="beachcomber">BeachComber</option>
            <option value="bob">Bob</option>
            <option value="bossman">Bossman</option>
            <option value="brute">Brute</option>
            <option value="captain">Captain</option>
            <option value="catgirl">Catgirl</option>
            <option value="childactor">ChildActor</option>
            <option value="dragonrider">Dragonrider</option>
            <option value="fisher">Fisher</option>
            <option value="hacker">Hacker</option>
            <option value="landbird">Landbird</option>
            <option value="misa">Misa</option>
            <option value="ninja">Ninja</option>
            <option value="robot">Robot</option>
            <option value="rookie">Rookie</option>
            <option value="sami">Sami</option>
            <option value="scientist">Scientist</option>
            <option value="spooky">Spooky</option>
            <option value="spyderboss">Spyderboss</option>
          </Select>
          <Button colorScheme="blue" onClick={()=>processUpdates('avatar')}> Save </Button>
        </Stack>
        
        <Heading p="4" as="h4" size="md">Saved Towns</Heading>
            <Box maxH="500px" overflowY="scroll">
              <Table>
                <Thead><Tr><Th>Town Name</Th><Th>Town ID</Th><Th>Town Type</Th><Th>Actions</Th><Th>Activity</Th></Tr></Thead>
                <Tbody>
                  {savedTowns?.map((town) => (
                    <Tr key={town.coveyTownID}><Td role='cell'>{town.friendlyName}</Td><Td
                      role='cell'>{town.coveyTownID}</Td>
                      <Td role='cell'>{town.publicStatus}</Td>
                      <Td role='cell'><Button onClick={() => handleJoin(town.coveyTownID)}
                                        disabled={town.currentOccupancy >= town.maximumOccupancy}>Connect
                                      </Button>
                                      <Button colorScheme="red" onClick={() => handleUnsave(town.coveyTownID)}>Unsave
                                      </Button>
                      </Td>
                      <Td role='cell'>{town.currentOccupancy}/{town.maximumOccupancy}</Td></Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            <Button data-testid='deletebutton' colorScheme="red" mr={3} onClick={()=>setIsOpen(true)} >
              Delete Account
            </Button>
            <AlertDialog
              motionPreset="slideInBottom"
              isOpen={isOpen}
              leastDestructiveRef={cancelRef}
              onClose={onClose}
              isCentered>
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Delete Account
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    Are you sure? You cannot undo this action afterwards.
                  </AlertDialogBody>

                  <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                      Cancel
                    </Button>
                    <Button colorScheme="red" onClick={()=>processUpdates('delete')} ml={3}>
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>

      </Stack>
    </IntroContainer>
    </div>
  );
} 

