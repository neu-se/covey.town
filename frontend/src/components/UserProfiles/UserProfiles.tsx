import { Box, Button, Flex, Heading, Stack } from '@chakra-ui/react';
import React from 'react';
import { findAllUserProfiles } from '../../graphql/queries';

export default function UserProfiles(): JSX.Element {
  // Function to create a town
  const handleCreate = async () => {
    const users = findAllUserProfiles();
    // leave this console statement until the user profile management jsx is integrated with this
    console.log(users);
  };

  return (
    <>
      <form>
        <Stack>
          <Box borderWidth='1px' borderRadius='lg'>
            <Heading p='4' as='h2' size='lg'>
              View the User Profiles
            </Heading>
            <Flex p='4'>
              <Box>
                <Button data-testid='newTownButton' onClick={handleCreate}>
                  View
                </Button>
              </Box>
            </Flex>
          </Box>
        </Stack>
      </form>
    </>
  );
}
