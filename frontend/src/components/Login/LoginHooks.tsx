import React, { useState } from 'react';
import { Button } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from 'react-google-login';
import CoveyTownUser from './User';
import useCoveyAppState from '../../hooks/useCoveyAppState';


const clientId =
  '147790869304-31si4r0ejgmklrphlis0eehdgk0qo9qo.apps.googleusercontent.com';

function LoginHooks(): JSX.Element {
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const { dbClient } = useCoveyAppState();

  const refreshTokenSetup = (res: any) => {
    let refreshTiming = (res.tokenObj.expires_in || 3600 - 5 * 60) * 1000;
  
    const refreshToken = async () => {
      const newAuthRes = await res.reloadAuthResponse();
      refreshTiming = (newAuthRes.expires_in || 3600 - 5 * 60) * 1000;
      console.log('newAuthRes:', newAuthRes);

      localStorage.setItem('authToken', newAuthRes.id_token);
  
      setTimeout(refreshToken, refreshTiming);
    };
  
    setTimeout(refreshToken, refreshTiming);
  };

  async function checkUserExistsInDB(userInfo: any) {
    // TODO
    // 1. check if user exists
    // await dbClient.userExistence({ email: userEmail });
    // 2. if user does not exist: this piece of code creates a new user if is does not exist and sets online = true
    await dbClient.addUser({ user: { firstName: userInfo.givenName, lastName: userInfo.familyName, email: userInfo.email, friends: [], isOnline: true }});
    // 3. if use exists: set isOnline = true
    // await dbClient.userExistence({ email: userInfo.email });
  }
    
  const onSuccess = (res: any) => {
    console.log('Login successful: currentUser:', res.profileObj);
    // setNewUserEmail(res.profileObj); // TODO: how to pass the email around to LogoutHooks and TownSelection?
    const userProfile = CoveyTownUser.getInstance();
    userProfile.setUserEmail(res.profileObj.email);
    userProfile.setUserName(res.profileObj.givenName)
    checkUserExistsInDB(res.profileObj);


    // TODO
    // Create a toast onSuccess
    refreshTokenSetup(res);
  };

  const onFailure = (res: any) => {
    console.log('Login failed: res:', res);
    alert(
      `Failed to login.`
    );

    // TODO
    // Create a toast onFailure
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