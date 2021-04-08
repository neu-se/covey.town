import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "@chakra-ui/react"
import PreJoinScreens from '../VideoCall/VideoFrontend/components/PreJoinScreens/PreJoinScreens';
import MediaErrorSnackbar
  from '../VideoCall/VideoFrontend/components/PreJoinScreens/MediaErrorSnackbar/MediaErrorSnackbar';
import { TownJoinResponse } from '../../classes/TownsServiceClient';

interface LoginProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}

export default function Login({ doLogin }: LoginProps): JSX.Element {
  const [mediaError, setMediaError] = useState<Error>();


  function Registration(): JSX.Element {  
    const auth0 = useAuth0();
    if (auth0.isLoading) {
        return <div>Authentication Loading ...</div>;
    }
  
    if (auth0.isAuthenticated) {
        return (
            <>
                <Button onClick={() => auth0.logout({ returnTo: window.location.origin })}>
                    Log Out
                </Button>
                <div>
                    <img src={auth0.user.picture} alt={auth0.user.name} />
                    <h2>Name: {auth0.user.name}</h2>
                    <p>Email: {auth0.user.email}</p> 
                </div>
            </>
        );
    }
  
    return <Button onClick={async () => { await auth0.loginWithRedirect(); }} >
      Log In or Sign Up
    </Button>;
  }

  return (
    <>
      <MediaErrorSnackbar error={mediaError} dismissError={() => setMediaError(undefined)} />
      <Registration />
      <PreJoinScreens
        doLogin={doLogin}
        setMediaError={setMediaError}
      />
    </>
  );
}
