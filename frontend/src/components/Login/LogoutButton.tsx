import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
    Button
  } from '@chakra-ui/react';

const LogoutButton = () => {
  const { isAuthenticated, logout } = useAuth0();


  return (
    <Button isDisabled = {!isAuthenticated} onClick={() => logout({ returnTo: window.location.origin })}>
      Log Out
    </Button>
  );
};

export default LogoutButton;