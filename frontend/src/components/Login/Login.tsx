import React, { useState } from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'; 
import Profile from '../Authentication/Profile'
import PreJoinScreens from '../VideoCall/VideoFrontend/components/PreJoinScreens/PreJoinScreens';
import MediaErrorSnackbar
  from '../VideoCall/VideoFrontend/components/PreJoinScreens/MediaErrorSnackbar/MediaErrorSnackbar';
import { TownJoinResponse } from '../../classes/TownsServiceClient';
import SplashPage from '../Splash/SplashPage';
import GQLExample from '../GQLExample/GQLExample'

interface LoginProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}

export default function Login({ doLogin }: LoginProps): JSX.Element {
  const [mediaError, setMediaError] = useState<Error>();

  return (
    <Router>
      <Switch>
        <Route exact path="/profile">
          <Profile doLogin={doLogin} />
        </Route>
        <Route exact path="/home">
          <MediaErrorSnackbar error={mediaError} dismissError={() => setMediaError(undefined)} />
          <PreJoinScreens
            doLogin={doLogin}
            setMediaError={setMediaError}
          />
        </Route>
        <Route exact path="/gqlex">
          <GQLExample />
        </Route>
        <Route path="/">
          <SplashPage />
        </Route>
      </Switch>
    </Router>
  );
}
