import { Box, Button, Flex } from '@chakra-ui/react';
import React from 'react';

export default function Chat(): JSX.Element {
  return (
    <Flex>
      <Box maxW='sm' m='auto' p='2' w='100%' borderWidth='2px' borderRadius='lg' overflow='hidden'>
        <Box p='2'>Chat</Box>
        <Box maxW='sm' m='auto' borderWidth='1px' borderRadius='lg' w='100%' p='4'>
          user1: hi user2: hello
        </Box>
        <Box p='2' align = 'center'>
          <Button bg = "tomato">Send global</Button>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <Button bg = "tomato">Send private</Button>
        </Box>
      </Box>
    </Flex>
  );
}
