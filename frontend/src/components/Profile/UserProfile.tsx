import React, { ChangeEvent, useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Image,
  Stack,
  Table,
  TableCaption,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';

const DEFAULT_PROFILE_PICTURE = 'https://w7.pngwing.com/pngs/752/876/png-transparent-yellow-emoji-illustration-emoji-sticker-text-messaging-iphone-emoticon-blushing-emoji-face-heart-smiley.png';

type ProfileFormInputs = {
  name: string;
  username: string;
  password: string;
  passwordConfirm: string;
  bio: string;
  email: string;
  pfpURL: string;
}

type EditingState = {
  editName: boolean;
  editUsername: boolean;
  editPassword: boolean;
  editBio: boolean;
  editEmail: boolean;
  editPfpURL: boolean;
  editing: boolean;
}

export default function UserProfile(): JSX.Element {
  const [state, setState] = useState<ProfileFormInputs>({
    name: '',
    username: '',
    password: '',
    passwordConfirm: '',
    bio: '',
    email: '',
    pfpURL: DEFAULT_PROFILE_PICTURE,
  });
  const [editState, setEditState] = useState<EditingState>({
    editName: false,
    editUsername: false,
    editPassword: false,
    editBio: false,
    editEmail: false,
    editPfpURL: false,
    editing: false,
  })
  const toast = useToast();

  const populateProfileData = () => {
    // TODO: Fetch user's profile data from database
    setState({
      name: 'Danny',
      username: 'dtran',
      password: 'abc',
      passwordConfirm: 'abc',
      bio: 'i\'m danny',
      email: 'dtran@gmail.com',
      pfpURL: DEFAULT_PROFILE_PICTURE
    })
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState((prevProps) => ({
      ...prevProps,
      [event.target.name]: event.target.value
    }));
  };

  // TODO: Check against database if username is unique
  const checkValidUsername = () => {}

  const checkValidPassword = () =>  state.password === state.passwordConfirm;

  const handleSubmit = () => {
    checkValidUsername();
    checkValidPassword();
    toast({
      title: 'Form Submitted!',
      description: `Your profile has been created! Name: ${state.name}, Username: ${state.username}, Email: ${state.email}, Bio: ${state.bio}`,
      status: 'success'
    });
  }

  const handleEditToggle = (toggle: string) => {
    setEditState((prevProps) => ({
      ...prevProps,
      editing: true,
      [toggle]: true
    }))
  }

  useEffect(() => {
    populateProfileData();
  }, [])

  return (
    <>
      <form onSubmit={(ev) => {
        ev.preventDefault();
        handleSubmit();}}>
        <Stack>
          <Box p="4" borderWidth="1px" borderRadius="lg">
            <Heading as="h2" size="lg">Set up your profile!</Heading>
            <FormControl>
              <FormLabel>Name</FormLabel>
              {
                editState.editName ?
                <Input onChange={event => handleInputChange(event)}
                name="name" placeholder="Your name" value={ state.name } /> :
                <span>
                  <Text>{ state.name } <IconButton aria-label="Edit Name" onClick={() => handleEditToggle('editName')}icon={<EditIcon/>}/>
                  </Text>
                </span>
              }
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              {
                editState.editUsername ?
                <Input onChange={event => handleInputChange(event)}
                 name="username" placeholder="Your username" value={ state.username } /> :
                <span>
                  <Text>{ state.username } <IconButton aria-label="Edit Username" onClick={() => handleEditToggle('editUsername')}icon={<EditIcon/>}/>
                  </Text>
                </span>
              }
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              {
                editState.editPassword ?
                <span>
                  <Input
                  onChange={event => handleInputChange(event)}
                  name="password" placeholder="Your password"
                  type='password'/>
                  <Text>Confirm Password</Text>
                  <Input
                  onChange={event => handleInputChange(event)}
                  name="passwordConfirm" placeholder="Type your password again"
                  type='password'/>
                </span> :
                <span>
                  <Button onClick={() => handleEditToggle('editPassword')}>
                    Click here to change password <EditIcon />
                  </Button>
                </span>
              }
            </FormControl>
            <FormControl>
              <FormLabel>Bio</FormLabel>
              {
                editState.editBio ?
                <Input name="bio" placeholder="Your bio" value={state.bio}/> :
                <span>
                  <Text>{ state.bio } <IconButton aria-label="Edit Bio" onClick={() => handleEditToggle('editBio')}icon={<EditIcon/>}/>
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
                type='email' value={state.email}/> :
                <span>
                  <Text>{ state.email } <IconButton aria-label="Edit Email" onClick={() => handleEditToggle('editEmail')}icon={<EditIcon/>}/></Text>
                </span>
              }
            </FormControl>
            <FormControl>
              <FormLabel>Profile picture</FormLabel>
              {
                editState.editPfpURL ?
                <Input onChange={event => handleInputChange(event)}
                value={ state.pfpURL }
                name="pfpURL" placeholder="Your profile picture URL"
                type='url' /> :
                <span>
                  <Image src={state.pfpURL} alt="Your Profile Picture" maxHeight="300px" maxWidth="300px"/>
                  <IconButton aria-label="Edit Profile Picture Link" onClick={() => handleEditToggle('editPfpURL')}icon={<EditIcon/>}/>
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
    </>
  );
}
