import React from 'react';
import {
  Heading,
  Avatar,
  Box,
  Center,
  Text,
  Stack,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import NavHeader from "./NavHeader"

// this component can be used for showing profile for users in proximity
const UserCard: React.FunctionComponent = () => {
  const { user } = useAuth0();
  return (
    <>
      <NavHeader />
      <Center py={6}>
        <Box
          maxW='320px'
          w='full'
          bg={useColorModeValue('white', 'gray.900')}
          boxShadow='2xl'
          rounded='lg'
          p={6}
          textAlign='center'>
          <Avatar
            size='xl'
            src={
              user.picture
            }
            alt='Avatar Alt'
            mb={4}
            pos='relative'

          />
          <Heading fontSize='2xl' fontFamily='body'>
            {user.name}
          </Heading>
          <Text fontWeight={600} color='gray.500' mb={4}>
            @{user.nickname}
          </Text>
          <Text
            textAlign='center'
            color={useColorModeValue('gray.700', 'gray.400')}
            px={3}>
            Bio goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </Text>


          <Stack mt={8} direction='row' spacing={4}>
            <Button
              flex={1}
              fontSize='sm'
              rounded='full'
              bg='blue.400'
              color='white'
              boxShadow=
              '0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'

              _hover={{
                bg: 'blue.500',
              }}
              _focus={{
                bg: 'blue.500',
              }}>
              View Profile
          </Button>
          </Stack>
        </Box>
      </Center>
    </>
  )
}

export default UserCard;