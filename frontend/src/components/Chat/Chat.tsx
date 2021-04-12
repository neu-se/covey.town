import { Box, Button, Flex, Input } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ChatMessage from './ChatMessage';

export default function Chat(): JSX.Element {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');

  const handleGlobalMessage = () => {
    setMessages([...messages, input]);
  }

  useEffect(() => {
    // console.log('messages changed');
  }, [messages])

  return (
    <Flex minH='768px' maxH='768px' w='100%' px='2' pt='2'>
      <Box
        m='auto'
        p='2'
        w='100%'
        borderWidth='2px'
        borderRadius='lg'
        overflow='hidden'
        minH='760px'
        maxH='760px'
        position='relative'
        flexDirection='column'>
        <Box p='2' align='left'>
          Chat
        </Box>
        <Box
          m='auto'
          borderWidth='1px'
          borderRadius='lg'
          w='100%'
          height='600px'
          p='4'
          align='left'
          overflow='auto'>
            <ChatMessage />
        </Box>
        <Box w='100%' position='absolute' bottom='0' pb='1'>
          <Box m='auto' w='100%' pb='2' pr='4' align='left'>
            <Input borderColor='#4299E1' onChange={event => setInput(event.target.value)} placeholder='Enter message here' value={input} />
          </Box>
          <Box pb='1' alignItems='center'>
            <Button colorScheme='blue' onClick = {handleGlobalMessage}>Send global</Button>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <Button colorScheme='blue'>Send private</Button>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
