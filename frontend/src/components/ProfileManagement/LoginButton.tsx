import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@chakra-ui/react";

function LoginButton(): JSX.Element {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <>
      {!isAuthenticated && (
        <Button color='blue.500' onClick={loginWithRedirect}>
          Log in
        </Button>
      )}
    </>
  );
}

export default LoginButton;
