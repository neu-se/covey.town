import React from 'react';
import { Heading, Text } from '@chakra-ui/react';
import DeviceSelectionScreen from './DeviceSelectionScreen/DeviceSelectionScreen';
import IntroContainer from '../IntroContainer/IntroContainer';
import { TownJoinResponse } from '../../../../../classes/TownsServiceClient';
import TownSelection from '../../../../Login/TownSelection';
import LoginPopUp from '../../../../Login/LoginPopUp';
import CreateAccountPopUp from '../../../../Login/CreateAccountPopUp';

export default function PreJoinScreens(props: { doLogin: (initData: TownJoinResponse) => Promise<boolean>; setMediaError?(error: Error): void }) {
  return (
    <IntroContainer>
      
      <CreateAccountPopUp />
      <LoginPopUp  />
      <Heading as="h2" size="xl" >Welcome to Covey.Town!</Heading>
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
