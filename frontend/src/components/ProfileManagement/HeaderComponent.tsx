import React from "react";
import { withRouter, Link } from "react-router-dom";
import { Box, Flex, HStack, Button, Stack, Heading, Spacer } from "@chakra-ui/react";
import { useAuth0 } from "@auth0/auth0-react";
import { createBreakpoints } from "@chakra-ui/theme-tools"
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import "../Styles/Header.css";

function HeaderComponent(): JSX.Element {
  const { isAuthenticated } = useAuth0();
const breakpoints = createBreakpoints({
 sm: "320px",
  md: "768px",
  lg: "960px",
  xl: "1200px",
})

  return (
    <>
      
        <Flex
          as="nav"
      align="center"
      justify="space-between"
     
      w="100%"
      h = {16}
      bg="blue.400"
      color="white"
        >
         
            <Box paddingLeft='70px'>
              <Heading size='md' fontSize='24px'>
                Covey Town
              </Heading>
            </Box>
            <Spacer/>
            <Stack direction='row' spacing={5} align='right'>
              {isAuthenticated && (
                <Link to='/twilio'>
                  {" "}
                  <Button size='md' color='blue.500'>
                    Enter Town
                  </Button>
                </Link>
              )}

              {isAuthenticated && (
                <Link to='/'>
                  {" "}
                  <Button size='md' color='blue.500'>
                    Profile
                  </Button>
                </Link>
              )}

              {isAuthenticated && <LogoutButton />}

              {!isAuthenticated && <LoginButton />}
            </Stack>
         
        </Flex>
    
    </>
  );
}

export default withRouter(HeaderComponent);