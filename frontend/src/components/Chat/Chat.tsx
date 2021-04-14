import { Box, Button, Flex, Input } from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import ChatMessage from './ChatMessage';

type MessageProps = {
  id: string;
  userName: string;
  color: string;
  message: string;
};

function Chat(): JSX.Element {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [input, setInput] = useState<string>('');
  const [privateUsername, setPrivateUsername] = useState<string>('');
  const { connect } = useVideoContext();
  const { apiClient } = useCoveyAppState();

  const setButtonColor = (messageType: string) => {
    if(messageType === 'global') {
      return '#38B2AC';
    } 
    if (messageType === 'private') {
      return '#9F7AEA';
    }
    return 'black';
  }

  const handlePrivateMessage = () => {
    if (input !== '') {
      setMessages([
        ...messages,
        { id: nanoid(), userName: `Me to ${privateUsername}`, color: setButtonColor('private'), message: input },
      ]);
      setInput('');
    }
  };

  const handleGlobalMessage = async () => {
    if (input !== '') {
      setMessages([...messages, { id: nanoid(), userName: 'Me', color: setButtonColor('global'), message: input }]);
      setInput('');
    }
  };

  useEffect(() => {
  }, [messages]);

  return (
    <Flex minH='500px' maxH='768px' minW='500px' w='100%' px='2' pt='2'>
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
          height='520px'
          p='4'
          align='left'
          overflow='auto'>
          {messages.map(msg => (
            <ChatMessage key={msg.id} userName={msg.userName} color={msg.color} message={msg.message} />
          ))}
        </Box>
        <Box w='100%' position='absolute' bottom='0' pb='1'>
          <Box m='auto' w='100%' pb='2' pr='4' align='left'>
            <Input
              borderColor='#4299E1'
              onChange={event => setInput(event.target.value)}
              placeholder='Enter message here'
              value={input}
            />
          </Box>
          <Box pb = '2' pr = '4' align='center'>
            <Button colorScheme='blue' onClick={handleGlobalMessage}>
              Send global
            </Button>
            <Input
              borderColor='#4299E1'
              onChange={event => setPrivateUsername(event.target.value)}
              placeholder='Enter username here'
              value={privateUsername}
            />
            <Button colorScheme='blue' onClick={handlePrivateMessage}>
              Send private
            </Button>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}

export default Chat;
