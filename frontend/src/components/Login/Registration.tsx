import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Auth0ContextInterface } from '@auth0/auth0-react';
import { Button, Image } from '@chakra-ui/react';

const useStyles = makeStyles(() => ({
    registration: {
      marginBottom: '3.5em',
    },
    userProfile: {
      float: 'right',
    },
    registrationButton: {
      float: 'left',
    },
    userEmail: {
      display: 'block',
      textAlign: 'right',
    },
}));

interface RegistrationProps {
    auth0: Auth0ContextInterface;
}

export default function Registration({ auth0 }: RegistrationProps): JSX.Element {
    const classes = useStyles();

    if (auth0.isLoading) {
        return <div>Authentication Loading ...</div>;
    }

    if (auth0.isAuthenticated) {
      return (
          <>
            <div className={classes.registration}>
              <Image className={classes.userProfile}
                borderRadius="full"
                boxSize="50px"
                src={auth0.user.picture}
                title={auth0.user.email}
              />
              <Button 
                className={classes.registrationButton}
                onClick={() => auth0.logout({ returnTo: window.location.origin })}>
                  Log Out
              </Button>
            </div>
          </>
      );
    }

    return (
      <>
        <div className={classes.registration}>
          <Button
            className={classes.registrationButton}
            onClick={async () => { await auth0.loginWithRedirect(); }} >
            Log In or Sign Up
          </Button>
        </div>
      </>
    );
}