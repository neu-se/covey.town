import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
    Button
  } from '@chakra-ui/react';

const LoginButton = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return <Button isDisabled = {isAuthenticated}	onClick={() => loginWithRedirect()}>Log In</Button>;
};

export default LoginButton;