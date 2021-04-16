import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Center,
  Heading,  
  Image,
  Select,
  Stack,
  Text
} from '@chakra-ui/react';
import { BsFillInfoCircleFill } from 'react-icons/bs'
import { makeStyles, Theme } from '@material-ui/core';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import IntroContainer from '../VideoCall/VideoFrontend/components/IntroContainer/IntroContainer';
import BackHomeButton from './BackHomeButton';

const useStyles = makeStyles((theme: Theme) => ({
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

export default function Profile(): JSX.Element {
  const { buttonContainer, bodyDiv } = useStyles();

  const { myPlayerID, players } = useCoveyAppState();
  const myPlayer = players.find((player) => player.id === myPlayerID);
  const [ currentAvatar, setCurrentAvatar ] = useState<string>(myPlayer?.currentAvatar || 'misa');
  const [ avatarPreview, setAvatarPreview ] = useState<string>('misa');
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAvatarPreview(event.target.value)
  }


  const handleSave = () => {
    // Todo: add logic
  }

  
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
            <Heading as="h2" size="md">Current User Avatar</Heading>
          </Center>   
        
          <Center>
            <Image
              boxSize="100px"
              objectFit="contain"
              src={`${process.env.PUBLIC_URL}/assets/atlas/tuxemon-${currentAvatar}/${currentAvatar}-front.png`}
            />
          </Center>
        </Box>
        <Box p="4" borderWidth="1px" borderRadius="lg">
          <Stack direction="row">
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
          <Select onChange={handleChange}>
            <option value="misa">Misa </option>
            <option value="catgirl">Catgirl</option>
            <option value="female">Spooky </option>
            <option value="childactor">ChildActor</option>
            <option value="beachcomber">BeachComber </option>
          </Select>
          <Button colorScheme="blue" onClick={handleSave}> Save </Button>
        </Stack>
        
      </Stack>
    </IntroContainer>
    </div>
  );
} 