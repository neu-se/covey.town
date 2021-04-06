import React, { Fragment } from 'react';
import {
  Heading,
  Avatar,
  Box,
  Center,
  Text,
  Button,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';
import {EditIcon} from '@chakra-ui/icons'
import { useAuth0 } from '@auth0/auth0-react';
import NavHeader from "./NavHeader"

const UserProfile = () => {
  const { user} = useAuth0();

  // dummy data. 
  // TODO: replace with data fetched from GET
  const details = [
                   {key: 'Location', value: 'Boston'},
                   {key: 'Hobbies', value: 'Gaming'},
                   {key: 'Relationship Status', value: 'Single'},
                   {key: 'Gender', value: 'Male'},
                   {key: 'Date of Birth', value: '31st June 1996'},
                  ]
return (
    <>
    <NavHeader/>
    <Center py={6}>
      <Box
        maxW='720px'
        w='full'
        bg={useColorModeValue('white', 'gray.900')}
        boxShadow='lg'
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
        <Text fontWeight={600} color='gray.500'>
          @{user.nickname}
        </Text>
        <Button
            flex={1}
            fontSize='sm'
            rounded='full'
            bg='blue.400'
            m={4}
            color='white'
            _hover={{
              bg: 'blue.500',
            }}
            _focus={{
              bg: 'blue.500',
            }}>
            <EditIcon mr={2}/> Edit Profile
          </Button>
        <Text
          textAlign='center'
          color={useColorModeValue('gray.700', 'gray.400')}
          px={3}>
          Bio goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </Text>
        <SimpleGrid columns={2} spacing={4} mt={4}>
        {details.map(detail => 
           <Fragment key={detail.key + user.sub}>
              <Text textAlign='left'>{detail.key}</Text>
              <Text textAlign='left'>{detail.value}</Text>
        </Fragment>)}
        </SimpleGrid>


      </Box>
    </Center>
      </>
    )
  }

  export default UserProfile;