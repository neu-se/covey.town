import React, { useEffect, useState } from 'react';
import { Heading, Text } from '@chakra-ui/react';
import DeviceSelectionScreen from './DeviceSelectionScreen/DeviceSelectionScreen';
import IntroContainer from '../IntroContainer/IntroContainer';
import Registration from '../../../../Login/Registration';
import { SaveUserRequest, TownJoinResponse } from '../../../../../classes/TownsServiceClient';
import TownSelection from '../../../../Login/TownSelection';
import { UserInfo } from '../../../../../CoveyTypes';
import { useAuth0 } from '@auth0/auth0-react';
import useCoveyAppState from '../../../../../hooks/useCoveyAppState';

export default function PreJoinScreens(props: { doLogin: (initData: TownJoinResponse) => Promise<boolean>; setMediaError?(error: Error): void }) {
  const auth0 = useAuth0();
  const { apiClient } = useCoveyAppState();

  const loggedOutUser = { userID: '', email: '', username: '', useAudio: false, useVideo: false, towns: [] };
  const [loggedIn, setLoggedIn] = useState<boolean>(auth0.isAuthenticated);
  const [userInfo, setUserInfo] = useState<UserInfo>(loggedOutUser);

  if (auth0.isAuthenticated !== loggedIn) {
    setLoggedIn(auth0.isAuthenticated);
  }

  async function updateUserInfo(userID: string) {
    const getResponse = await apiClient.getUser({ userID });
    setUserInfo(getResponse as UserInfo);
  }

  async function saveUserInfo(request: SaveUserRequest) {
    try {
      await apiClient.saveUser(request);
      updateUserInfo(request.userID);
    } catch (err) {
      console.log(err.toString());
      // Do nothing
    }
  }

  useEffect(() => {
    if (loggedIn) {
      saveUserInfo({ userID: auth0.user.sub, email: auth0.user.email });
    }
    else {
      setUserInfo(loggedOutUser);
    }
  }, [loggedIn]);

  return (
    <IntroContainer>
      <Registration
        auth0={auth0}
      />
      <Heading as="h2" size="xl">Welcome to Covey.Town{userInfo.username ? `, ${userInfo.username}` : ''}!</Heading>
      <Text p="4">
        Covey.Town is a social platform that integrates a 2D game-like metaphor with video chat.
        To get started, setup your camera and microphone, choose a username, and then create a new town
        to hang out in, or join an existing one.
      </Text>
      <DeviceSelectionScreen
        savedAudioPreference={userInfo.useAudio}
        savedVideoPreference={userInfo.useVideo}
        setMediaError={props.setMediaError}
        setUserInfo={setUserInfo}
      />
      <TownSelection
        username={userInfo.username}
        doLogin={props.doLogin} 
        setUserInfo={setUserInfo}
      />
    </IntroContainer>
  );
}
