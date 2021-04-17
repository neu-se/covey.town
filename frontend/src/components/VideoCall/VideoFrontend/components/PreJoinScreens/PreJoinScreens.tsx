import React, { useEffect, useState } from 'react';
import { Heading, Text, useToast } from '@chakra-ui/react';
import DeviceSelectionScreen from './DeviceSelectionScreen/DeviceSelectionScreen';
import IntroContainer from '../IntroContainer/IntroContainer';
import Registration from '../../../../Login/Registration';
import { SaveUserRequest, TownJoinResponse } from '../../../../../classes/CoveyServicesClient';
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

  async function saveUserInfo(request: SaveUserRequest) {
    try {
      await apiClient.saveUser(request);
      const getResponse = await apiClient.getUser({ userID: request.userID });
      setUserInfo(getResponse as UserInfo);
    } catch {
      // do nothing
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
        setUserInfo={setUserInfo}
      />
      <Heading as="h2" size="xl">Welcome to Covey.Town{userInfo.username ? `, ${userInfo.username}` : ''}!</Heading>
      <Text p="4">
        Covey.Town is a social platform that integrates a 2D game-like metaphor with video chat.
        To get started, setup your camera and microphone, choose a username, and then create a new town
        to hang out in, or join an existing one.<br /><br />
        {auth0.isAuthenticated ?
          `If you are logging in again, welcome back! If this is your first time signing in, you can save your
          device and username preferences with the corresponding 'Save' buttons. By default, your saved preferences
          are muted audio, hidden video, and a blank username. These can be restored with the 'Reset Settings' button.` : ''
        }
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
