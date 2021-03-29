import React, { ChangeEvent, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import assert from 'assert';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Image,
  Stack,
  Text,
  useToast
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import IntroContainer from '../VideoCall/VideoFrontend/components/IntroContainer/IntroContainer';
import RealmDBClient from '../../services/database/RealmDBClient'
import { CoveyUserProfile } from '../../CoveyTypes';
import useAuthInfo from '../../hooks/useAuthInfo';
import RealmAuth from '../../services/authentication/RealmAuth';
import IAuth from '../../services/authentication/IAuth';

const DEFAULT_PROFILE_PICTURE = 'https://w7.pngwing.com/pngs/752/876/png-transparent-yellow-emoji-illustration-emoji-sticker-text-messaging-iphone-emoticon-blushing-emoji-face-heart-smiley.png';

type ProfileFormInputs = {
  username: string;
  bio: string;
  email: string;
  pfpURL: string;
}

type EditingState = {
  editUsername: boolean;
  editBio: boolean;
  editEmail: boolean;
  editPfpURL: boolean;
  editing: boolean;
}

export default function UserProfile(): JSX.Element {
  const db = RealmDBClient.getInstance();
  const toast = useToast();
  const history = useHistory();
  const authInfo = useAuthInfo();
  const auth: IAuth = RealmAuth.getInstance();

  const [state, setState] = useState<ProfileFormInputs>({
    username: '',
    bio: '',
    email: '',
    pfpURL: DEFAULT_PROFILE_PICTURE,
  });

  const [editState, setEditState] = useState<EditingState>({
    editUsername: false,
    editBio: false,
    editEmail: false,
    editPfpURL: false,
    editing: false,
  })

  const populateProfileData = async () => {
    if(authInfo.currentUser) {
      setState({
        username: `${authInfo.currentUser.profile.userName || `You don't have a username yet!`}`,
        bio: `${authInfo.currentUser.profile.bio || 'Your bio is empty!'}`,
        email: `${authInfo.currentUser.profile.email || `How can you not have an email by now???`}`,
        pfpURL: `${authInfo.currentUser.profile.pfpURL || DEFAULT_PROFILE_PICTURE}`
      })
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState((prevProps) => ({
      ...prevProps,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    if(state && authInfo.currentUser) {
      const changes : CoveyUserProfile = {
        user_id: authInfo.currentUser.id,
        userName: authInfo.currentUser.profile.userName,
        email: authInfo.currentUser.profile.email,
        pfpURL: authInfo.currentUser.profile.pfpURL,
        bio: authInfo.currentUser.profile.bio,
      }
      if(editState.editUsername) {
        changes.userName = state.username
      }
      if(editState.editBio) {
        changes.bio = state.bio
      }
      if(editState.editEmail) {
        changes.email = state.email
      }
      if(editState.editPfpURL) {
        changes.pfpURL = state.pfpURL
      }
      try {
        await db.saveUserProfile(changes);
        assert(authInfo.currentUser);
        if(authInfo.currentUser) {
          authInfo.currentUser.profile = changes;
          authInfo.actions.setAuthState({
            isLoggedIn: authInfo.currentUser.isLoggedIn,
            currentUser: authInfo.currentUser
          })
        }
        toast({
          title: 'Form Submitted!',
          description: `Your profile has been saved! Username: ${changes.userName}, Email: ${changes.email}, Bio: ${changes.bio}`,
          status: 'success'
        });
        setEditState(() => ({
          editUsername: false,
          editBio: false,
          editEmail: false,
          editPfpURL: false,
          editing: false,
        }))
      } catch (e) {
        toast({
          title: 'Failed to save changes!',
          description: `Error: ${e}`,
          status: 'error'
        });
      }
    }
  }

  const handleEditToggle = (toggle: string) => {
    setEditState((prevProps) => ({
      ...prevProps,
      editing: true,
      [toggle]: true
    }))
  }

  const handleGoBack = () => history.push('/')

  const handlePasswordReset = async () => {
    try {
      await auth.sendPasswordResetEmail(state.email);
      toast({
        title: 'Password Reset Email Sent!',
        description: `An email to reset your password has been sent to ${state.email}.`,
        status: 'success'
      })
    } catch (e) {
      toast({
        title: 'Cannot Send Password Reset Email!',
        description: `Tried sending an email to ${state.email} but failed. Error: ${e}`,
        status: 'error'
      })
    }
  }

  useEffect(() => {
    populateProfileData();
  }, [db]);

  return (
    <>
      <IntroContainer>
        <Button mb={4} onClick={handleGoBack}>Back to main page</Button>
        {
          authInfo.currentUser !== null &&
          <form onSubmit={(ev) => {
            ev.preventDefault();
            handleSubmit();
          }}>
            <Stack>
              <Box p="4" borderWidth="1px" borderRadius="lg">
                <Heading as="h2" size="lg">Set up your profile!</Heading>
                <FormControl>
                  <FormLabel>Username</FormLabel>
                  {
                    editState.editUsername ?
                      <Input onChange={event => handleInputChange(event)}
                        name="username" placeholder="Your username" value={state.username} /> :
                      <span>
                        <Text>{state.username} <IconButton aria-label="Edit Username" onClick={() => handleEditToggle('editUsername')} icon={<EditIcon />} />
                        </Text>
                      </span>
                  }
                </FormControl>
                <FormControl>
                  <FormLabel>Password</FormLabel>
                    <span>
                      <Button onClick={handlePasswordReset}>
                        Click here to change password <EditIcon />
                      </Button>
                    </span>
                </FormControl>
                <FormControl>
                  <FormLabel>Bio</FormLabel>
                  {
                    editState.editBio ?
                      <Input name="bio" placeholder="Your bio" value={state.bio} onChange={event => handleInputChange(event)}/> :
                      <span>
                        <Text>{state.bio} <IconButton aria-label="Edit Bio" onClick={() => handleEditToggle('editBio')} icon={<EditIcon />} />
                        </Text>
                      </span>
                  }
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  {
                    editState.editEmail ?
                      <Input onChange={event => handleInputChange(event)}
                        name="email" placeholder="Your email"
                        type='email' value={state.email} /> :
                      <span>
                        <Text>{state.email} <IconButton aria-label="Edit Email" onClick={() => handleEditToggle('editEmail')} icon={<EditIcon />} /></Text>
                      </span>
                  }
                </FormControl>
                <FormControl>
                  <FormLabel>Profile picture</FormLabel>
                  {
                    editState.editPfpURL ?
                      <Input onChange={event => handleInputChange(event)}
                        value={state.pfpURL}
                        name="pfpURL" placeholder="Your profile picture URL"
                        type='url' /> :
                      <span>
                        <Image src={state.pfpURL} alt="Your Profile Picture" maxHeight="300px" maxWidth="300px" />
                        <IconButton aria-label="Edit Profile Picture Link" onClick={() => handleEditToggle('editPfpURL')} icon={<EditIcon />} />
                      </span>
                  }
                </FormControl>
                {
                  editState.editing &&
                  <Button mt={4} type="submit">Save Profile</Button>
                }
              </Box>
            </Stack>
          </form>
        }
      </IntroContainer>
    </>
  );
}
