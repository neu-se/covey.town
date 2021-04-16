import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Button
} from '@chakra-ui/react'

const LogoutButton = (): JSX.Element => {
  const { logout } = useAuth0();

  return (
    <Button color = "blue.500" mr={9} onClick={() => logout({ returnTo: window.location.origin })}>
      Log Out
    </Button>
  );
};

export default LogoutButton;
