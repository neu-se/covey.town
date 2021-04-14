import { Box, Button, Flex, Input, useToast } from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import React, { useCallback, useEffect, useState } from 'react';
import AChatMessage from '../../classes/AChatMessage';
import GlobalChatMessage from '../../classes/GlobalChatMessage';
import PrivateChatMessage from '../../classes/PrivateChatMessage';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import ChatMessage, { MessageProps } from './ChatMessage';

function Chat(): JSX.Element {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [input, setInput] = useState<string>('');
  const [privateUsername, setPrivateUsername] = useState<string>('');
  const { connect } = useVideoContext();
  const { userName, currentTownID, myPlayerID, players, apiClient } = useCoveyAppState();
  const toast = useToast();

  const setButtonColor = (messageType: string) => {
    if (messageType === 'global') {
      return '#38B2AC';
    }
    if (messageType === 'private') {
      return '#9F7AEA';
    }
    return 'black';
  };

  const messageToProps = useCallback((msg: AChatMessage, type: string): MessageProps => 
      ({key: nanoid(),
      userName: msg.sender.userName,
      color: setButtonColor(type),
      message: msg.message,}), [])

  const handlePrivateMessage = async () => {
    if (input !== '') {
      try {
        const currPlayer = players.find(p => p.id === myPlayerID);
        const toPlayer = players.find(p => p.userName === privateUsername);
        let privateMessage;
        if (currPlayer) {
          if (toPlayer) {
            privateMessage = new PrivateChatMessage(input, currPlayer, toPlayer);
          }
          toast({
            title: 'Player does not exist',
            status: 'error',
          });
        }
        if (privateMessage) {
          await apiClient.sendPrivatePlayerMessage({
            coveyTownID: currentTownID,
            message: privateMessage,
          });
          setMessages([
            ...messages,
            {
              key: nanoid(),
              userName: `${userName} to ${privateUsername}`,
              color: setButtonColor('private'),
              message: input,
            },
          ]);
          setInput('');
        }
      } catch (err) {
        toast({
          title: 'Message unable to send',
          status: 'error',
        });
      }
    } else {
      toast({
        title: "Message can't be blank",
        status: 'error',
      });
    }
  };

  const handleGlobalMessage = async () => {
    if (input !== '') {
      try {
        const currPlayer = players.find(p => p.id === myPlayerID);
        let globalMessage;
        if (currPlayer) {
          globalMessage = new GlobalChatMessage(input, currPlayer);
        }

        if (globalMessage) {
          await apiClient.sendGlobalPlayerMessage({
            coveyTownID: currentTownID,
            message: globalMessage,
          });
          setMessages([
            ...messages,
            { key: nanoid(), userName, color: setButtonColor('global'), message: input },
          ]);
        }
        // do toasts if message is not sent
        setInput('');
      } catch (err) {
        toast({
          title: 'Message unable to send',
          status: 'error',
        });
      }
    } else {
      toast({
        title: "Message can't be blank",
        status: 'error',
      });
    }
  };

  const initMessages = useCallback(async () => {
    const prevMessages = await apiClient.getMessages({ coveyTownID: currentTownID });
    setMessages(prevMessages.messages.map(msg => messageToProps(msg, 'private')));
  }, [setMessages, apiClient, currentTownID, messageToProps]);

  useEffect(() => {
    initMessages();
  }, [initMessages]);

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
            <ChatMessage
              key={msg.key}
              userName={msg.userName}
              color={msg.color}
              message={msg.message}
            />
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
          <Box pb='2' pr='4' align='center'>
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
