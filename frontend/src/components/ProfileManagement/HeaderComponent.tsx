import React from "react";
import { withRouter, Link } from "react-router-dom";
import { Box, Flex, HStack, Button, Stack, Heading } from "@chakra-ui/react";
import { useAuth0 } from "@auth0/auth0-react";

import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import "../Styles/Header.css";

function HeaderComponent(): JSX.Element {
  const { isAuthenticated } = useAuth0();

  return (
    <>
      <Box bg='blue.500' px={5}>
        <Flex
          color='white'
          h={16}
          alignItems='center'
          justifyContent='space-between'
        >
          <HStack spacing={1000} alignItems='center'>
            <Box boxShadow='base' paddingLeft='100px'>
              <Heading size='md' fontSize='29px'>
                Covey Town
              </Heading>
            </Box>
            <Stack direction='row' spacing={5} align='right'>
              {isAuthenticated && (
                <Link to='/twilio'>
                  {" "}
                  <Button size='md' color='blue.500'>
                    Enter Town
                  </Button>
                </Link>
              )}

              {isAuthenticated && <LogoutButton />}

              {!isAuthenticated && <LoginButton />}
            </Stack>
          </HStack>
        </Flex>
      </Box>
    </>
  );
}

export default withRouter(HeaderComponent);
