import { Heading, Text } from '@chakra-ui/react';
import React from 'react';
import { TownJoinResponse } from '../../../../../classes/TownsServiceClient';
import TownSelection from '../../../../Login/TownSelection';
import IntroContainer from '../IntroContainer/IntroContainer';
import DeviceSelectionScreen from './DeviceSelectionScreen/DeviceSelectionScreen';

export default function PreJoinScreens(props: {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>;
  setMediaError?(error: Error): void;
}) {
  return (
    <IntroContainer>
      <Heading as='h2' size='xl'>
        Welcome to Covey.Town!
      </Heading>
      <Text p='4'>
        Covey.Town is a social platform that integrates a 2D game-like metaphor with video chat. To
        get started, setup your camera and microphone, choose a username, and then create a new town
        to hang out in, or join an existing one.
      </Text>
      <DeviceSelectionScreen setMediaError={props.setMediaError} />
      <TownSelection doLogin={props.doLogin} />
    </IntroContainer>
  );
}
