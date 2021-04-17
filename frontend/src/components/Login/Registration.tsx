import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Auth0ContextInterface } from '@auth0/auth0-react';
import { Button, Image, useToast } from '@chakra-ui/react';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import { UserInfo } from '../../CoveyTypes';

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
    deleteAccountButton: {
      float: 'right',
      marginRight: '.5em',
    },
    userEmail: {
      display: 'block',
      textAlign: 'right',
    },
}));

interface RegistrationProps {
    auth0: Auth0ContextInterface;
    setUserInfo(userInfo: UserInfo): void;
}

export default function Registration({ auth0, setUserInfo }: RegistrationProps): JSX.Element {
    const classes = useStyles();
    const { apiClient } = useCoveyAppState();
    const toast = useToast();

    if (auth0.isLoading) {
        return <div>Authentication Loading ...</div>;
    }

    const resetAccountHandler = async (userID: string) => {
      try {
        await apiClient.resetUser({ userID });
        toast({
          title: 'Successfully reset account preferences to default.',
          description: 'You will now be muted, will not show video, and have no username by default.',
          status: 'success',
        });
        const getResponse = await apiClient.getUser({ userID });
        setUserInfo(getResponse);
      } catch (err) {
        toast({
          title: 'Unable to connect to Account Service',
          description: err.toString(),
          status: 'error',
        });
      }
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
              <Button
                className={classes.deleteAccountButton}
                onClick={() => {
                  resetAccountHandler(auth0.user.sub);
                }}>
                  Reset Settings
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