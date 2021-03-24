import React from 'react';
import { useGoogleLogin } from 'react-google-login';

const clientId =
  '147790869304-31si4r0ejgmklrphlis0eehdgk0qo9qo.apps.googleusercontent.com';

function LoginHooks() {
  const onSuccess = (res: any) => {
    console.log('Login Success: currentUser:', res.profileObj);
    alert(
      `Logged in successfully welcome ${res.profileObj.name} 😍. \n See console for full profile object.`
    );
    refreshTokenSetup(res);
  };

  const onFailure = (res: any) => {
    console.log('Login failed: res:', res);
    alert(
      `Failed to login.`
    );
  };
  const refreshTokenSetup = (res: any) => {
    // Timing to renew access token
    let refreshTiming = (res.tokenObj.expires_in || 3600 - 5 * 60) * 1000;
  
    const refreshToken = async () => {
      const newAuthRes = await res.reloadAuthResponse();
      refreshTiming = (newAuthRes.expires_in || 3600 - 5 * 60) * 1000;
      console.log('newAuthRes:', newAuthRes);
      // saveUserToken(newAuthRes.access_token);  <-- save new token
      localStorage.setItem('authToken', newAuthRes.id_token);
  
      // Setup the other timer after the first one
      setTimeout(refreshToken, refreshTiming);
    };
  
    // Setup first refresh timer
    setTimeout(refreshToken, refreshTiming);
  };

  const { signIn } =  useGoogleLogin({
    onSuccess,
    onFailure,
    clientId,
    isSignedIn: true,
    accessType: 'offline',
    // responseType: 'code',
    // prompt: 'consent',
  });

  return (
    <button onClick={signIn} className="button">
      {/* <img src="icons/google.svg" alt="google login" className="icon"></img> */}
      <span className="buttonText">Sign in with Google</span>
    </button>
  );
}

export default LoginHooks;