import React from 'react';
import { Button } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from 'react-google-login';

const clientId =
  '147790869304-31si4r0ejgmklrphlis0eehdgk0qo9qo.apps.googleusercontent.com';

function LoginHooks(): JSX.Element {

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
    
  const onSuccess = (res: any) => {
    console.log('Login successful: currentUser:', res.profileObj);
    refreshTokenSetup(res);
  };

  const onFailure = (res: any) => {
    console.log('Login failed: res:', res);
    alert(
      `Failed to login.`
    );
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