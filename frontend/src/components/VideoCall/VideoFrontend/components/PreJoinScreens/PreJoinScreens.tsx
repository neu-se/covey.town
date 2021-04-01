import React from 'react';
import { Heading, Text } from '@chakra-ui/react';
import { useAuth0 } from "@auth0/auth0-react";
import { makeStyles, Theme } from '@material-ui/core';
import DeviceSelectionScreen from './DeviceSelectionScreen/DeviceSelectionScreen';
import IntroContainer from '../IntroContainer/IntroContainer';
import { TownJoinResponse } from '../../../../../classes/TownsServiceClient';
import TownSelection from '../../../../Login/TownSelection';
import AuthHero from '../../../../Authentication/AuthHero';


const useStyles = makeStyles((theme: Theme) => ({
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: '30px',
  }
}));

export default function PreJoinScreens(props: { doLogin: (initData: TownJoinResponse) => Promise<boolean>; setMediaError?(error: Error): void }) {
  const { buttonContainer } = useStyles();
  const { user, isAuthenticated } = useAuth0();
  return (
    <IntroContainer>
      <div className={buttonContainer}>
        <AuthHero />
      </div>
      <Heading as="h3" size="lg">{isAuthenticated? `Welcome to Covey.Town, ${user.given_name}!`:'Welcome to Covey.Town!'}</Heading>
      <Text p="4">
        Covey.Town is a social platform that integrates a 2D game-like metaphor with video chat.
        To get started, setup your camera and microphone, choose a username, and then create a new town
        to hang out in, or join an existing one.
      </Text>
      <DeviceSelectionScreen setMediaError={props.setMediaError} />
      <TownSelection doLogin={props.doLogin} />
    </IntroContainer>
  );
}
