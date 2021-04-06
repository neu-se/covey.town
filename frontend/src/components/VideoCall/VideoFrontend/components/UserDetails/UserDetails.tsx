import "./UserDetails.css";
import { RedirectLoginOptions, useAuth0 } from '@auth0/auth0-react';
import React, { ReactNode } from 'react';
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
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';

const NavLink = ({ children, url }: { children: ReactNode, url: (options?: RedirectLoginOptions | undefined) => Promise<void> }) => (
  <Link
    px={2}
    py={1}
    rounded='md'
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    onClick={url}
    href='/'>
    {children}
  </Link>
);

const UserDetails = () => {
  const { user, isAuthenticated, logout, loginWithRedirect } = useAuth0();
  const { isOpen, onOpen, onClose } = useDisclosure();

    return (
      <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems='center' justifyContent='space-between'>
          <IconButton
            size='md'
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label='Open Menu'
            display={{ md: !isOpen ? 'none' : 'inherit' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems='center'>
            <Box>Covey.Town</Box>
          </HStack>
          
          { isAuthenticated &&
          <Flex alignItems='center'>
            <Menu>
              <Box>Hello, {user.name}!</Box> 
              <MenuButton
                as={Button}
                rounded='full'
                variant='link'
                cursor='pointer'>
                <Avatar
                  name = {user.name}
                  size='sm'
                  src={user.picture}
                />
              </MenuButton>
              <MenuList>
                <MenuItem>View Profile</MenuItem>
                <MenuDivider />
                <MenuItem onClick={() => logout({ returnTo: window.location.origin })}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
          }

          { !isAuthenticated &&
          <Flex alignItems='center'>
            <Menu>
            <HStack
              as='nav'
              spacing={4}
              display={{ base: 'none', md: 'flex' }}>
                <NavLink url={loginWithRedirect}>Login</NavLink>              
            </HStack>
            </Menu>
          </Flex>
          }

        {/* {isOpen ? (
          <Box pb={4}>
            <Stack as='nav' spacing={4}>
              <NavLink url={loginWithRedirect}>Login</NavLink>
            </Stack>
          </Box>
        ) : null} */}

        </Flex>

      </Box>
      </>
      );
};

export default UserDetails;
