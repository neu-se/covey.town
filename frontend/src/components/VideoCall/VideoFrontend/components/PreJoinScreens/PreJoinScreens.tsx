import React, { useEffect, useState } from 'react';
import { Heading, Text } from '@chakra-ui/react';
import DeviceSelectionScreen from './DeviceSelectionScreen/DeviceSelectionScreen';
import IntroContainer from '../IntroContainer/IntroContainer';
import Registration from '../../../../Login/Registration';
import { TownJoinResponse } from '../../../../../classes/TownsServiceClient';
import TownSelection from '../../../../Login/TownSelection';
import { UserInfo } from '../../../../../CoveyTypes';
import { useAuth0 } from '@auth0/auth0-react';

export default function PreJoinScreens(props: { doLogin: (initData: TownJoinResponse) => Promise<boolean>; setMediaError?(error: Error): void }) {
  const auth0 = useAuth0();

  const loggedOutUser = { userID: '', email: '', username: '', useAudio: false, useVideo: false, maps: [] };
  const getData = { userID: 'test123', username: 'testuser123', email: 'testuser123@email.com', useAudio: true, useVideo: false, maps: [] };
  const [loggedIn, setLoggedIn] = useState<boolean>(auth0.isAuthenticated);
  const [userInfo, setUserInfo] = useState<UserInfo>(auth0.isAuthenticated ? getData : loggedOutUser);

  if (auth0.isAuthenticated !== loggedIn) {
    setLoggedIn(auth0.isAuthenticated);
  }

  useEffect(() => {
    if (loggedIn) {
      const userID = auth0.user.sub;
      // TODO actually call API
      // MOCK API CALL for get RETURNS:
      const saveData = { success: true }
      const getData = { userID: 'test123', username: 'testuser123', email: 'testuser123@email.com', useAudio: true, useVideo: false, maps: [] }
      setUserInfo({ userID: getData.userID, email: getData.email, username: getData.username, useAudio: getData.useAudio, useVideo: getData.useVideo, maps: getData.maps });
      console.log('Im logged in')
    }
    else {
      // set to default value
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
        useAudio={userInfo.useAudio}
        useVideo={userInfo.useVideo}
        setMediaError={props.setMediaError}
      />
      {console.log(userInfo.username)}
      <TownSelection
        username={userInfo.username}
        doLogin={props.doLogin} />
    </IntroContainer>
  );
}
