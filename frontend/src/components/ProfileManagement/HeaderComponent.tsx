import React, { useState } from 'react';
import {withRouter} from "react-router-dom";
import {
  Box,
  Flex,
  Avatar,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
} from '@chakra-ui/react';
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import "../Styles/Header.css";

function HeaderComponent() {

  const {isAuthenticated} = useAuth0()

    const [state , setState] = useState({
        email : "",
        password : "",
        successMessage: null
    })


    return (
      <>
        <Box bg="blue.500" px={4}>
          <Flex color="white" h={16} alignItems="center" justifyContent="space-between">
            <HStack spacing={1000} alignItems="center">
              <Box>Covey Town</Box>
              <Flex color="blue.500" alignItems="right">
                {
                  isAuthenticated && <LogoutButton/>
                }
                {
                  !isAuthenticated && <LoginButton/>
                }
              </Flex>
            </HStack>
          </Flex>
        </Box>
      </>
    )
}

export default withRouter(HeaderComponent);

