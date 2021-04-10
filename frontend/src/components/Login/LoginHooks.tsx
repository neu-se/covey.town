import React from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from 'react-google-login';
import CoveyTownUser from './User';
import useCoveyAppState from '../../hooks/useCoveyAppState';


const clientId =
  '147790869304-31si4r0ejgmklrphlis0eehdgk0qo9qo.apps.googleusercontent.com';

function LoginHooks(): JSX.Element {
  const { dbClient } = useCoveyAppState();
  const toast = useToast();

  const refreshTokenSetup = (res: any) => {
    let refreshTiming = (res.tokenObj.expires_in || 3600 - 5 * 60) * 1000;
  
    const refreshToken = async () => {
      const newAuthRes = await res.reloadAuthResponse();
      refreshTiming = (newAuthRes.expires_in || 3600 - 5 * 60) * 1000;

      localStorage.setItem('authToken', newAuthRes.id_token);
  
      setTimeout(refreshToken, refreshTiming);
    };
  
    setTimeout(refreshToken, refreshTiming);
  };

  async function checkUserExistsInDB(userInfo: any) {
    const userExists = await dbClient.userExistence({ email: userInfo.email });

    if (userExists) {
      await dbClient.setOnlineStatus({ email: userInfo.email, isOnline: true });
    } else {
      await dbClient.addUser({ user: { firstName: userInfo.givenName, lastName: userInfo.familyName, email: userInfo.email, friends: [], isOnline: true }});
    }
  }
    
  const onSuccess = (res: any) => {
    // Save the user data in CoveyTownUser singleton
    const userProfile = CoveyTownUser.getInstance();
    userProfile.setUserEmail(res.profileObj.email);
    userProfile.setUserName(res.profileObj.givenName);
    userProfile.setUserStatus(true);

    // Checking if user exists in database
    checkUserExistsInDB(res.profileObj);

    toast({
      title: `Login Successful! Welcome to Covey.Town ${res.profileObj.givenName}`,
      status: 'success',
    })
    
    refreshTokenSetup(res);
  };

  const onFailure = (res: any) => {
    toast({
      title: 'Google Login failed',
      status: 'error',
    });
  };

  const { signIn } =  useGoogleLogin({
    onSuccess,
    onFailure,
    clientId,
    isSignedIn: true,
    accessType: 'offline',
  });

  return (
    <Button 
        leftIcon={<FcGoogle />} 
        size="lg"
        colorScheme="Google" 
        variant="solid" 
        color="blue.500" 
        border="2px" 
        borderColor="blue.500"
        _hover={{ bg: "#ebedf0" }} 
        onClick={signIn}
    >
    Sign in
    </Button>
  );
}

export default LoginHooks;