import React, { ChangeEvent, useState } from 'react';
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast
} from '@chakra-ui/react';

const DEFAULT_PROFILE_PICTURE = 'https://w7.pngwing.com/pngs/752/876/png-transparent-yellow-emoji-illustration-emoji-sticker-text-messaging-iphone-emoticon-blushing-emoji-face-heart-smiley.png';

type ProfileFormInputs = {
  name: string;
  username: string;
  password: string;
  bio: string;
  email: string;
  pfpURL: string;
}

export default function UserProfile(): JSX.Element {
  const [state, setState] = useState<ProfileFormInputs>({
    name: '',
    username: '',
    password: '',
    bio: '',
    email: '',
    pfpURL: DEFAULT_PROFILE_PICTURE,
  });
  const toast = useToast();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState((prevProps) => ({
      ...prevProps,
      [event.target.name]: event.target.value
    }));
  };

  // TODO: Check against database if username is unique
  const checkValidUsername = () => {}

  const handleSubmit = () => {
    checkValidUsername();
    toast({
      title: 'Form Submitted!',
      description: `Your profile has been created! Name: ${state.name}, Username: ${state.username}, Email: ${state.email}, Bio: ${state.bio}`,
      status: 'success'
    });
  }

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
              <Input onChange={event => handleInputChange(event)}
              name="name" placeholder="Your name"/>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input onChange={event => handleInputChange(event)}
               name="username" placeholder="Your username"/>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
              onChange={event => handleInputChange(event)}
              name="password" placeholder="Your password"
              type='password'/>
            </FormControl>
            <FormControl>
              <FormLabel>Bio</FormLabel>
              <Input name="bio" placeholder="Your bio"/>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input onChange={event => handleInputChange(event)}
              name="email" placeholder="Your email"
              type='email'/>
            </FormControl>
            <FormControl>
              <FormLabel>Profile picture</FormLabel>
              <Input onChange={event => handleInputChange(event)}
              value={DEFAULT_PROFILE_PICTURE}
              name="pfpURL" placeholder="Your profile picture URL"
              type='url' />
            </FormControl>
            <Button mt={4} type="submit">Create Profile</Button>
          </Box>
        </Stack>
      </form>
    </>
  );
}
