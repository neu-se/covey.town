import React, { useState } from 'react';
import {Switch, Route} from 'react-router-dom'; 
import Profile from '../Authentication/Profile'
import PreJoinScreens from '../VideoCall/VideoFrontend/components/PreJoinScreens/PreJoinScreens';
import MediaErrorSnackbar
  from '../VideoCall/VideoFrontend/components/PreJoinScreens/MediaErrorSnackbar/MediaErrorSnackbar';
import { TownJoinResponse } from '../../classes/TownsServiceClient';

interface LoginProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}

export default function Login({ doLogin }: LoginProps): JSX.Element {
  const [mediaError, setMediaError] = useState<Error>();

  return (
    <Switch>
      <Route exact path="/profile">
        <Profile />
      </Route>
      <Route>
      <>
        <MediaErrorSnackbar error={mediaError} dismissError={() => setMediaError(undefined)} />
        <PreJoinScreens
          doLogin={doLogin}
          setMediaError={setMediaError}
        />
      </>
      </Route>
  </Switch>
  );
}
