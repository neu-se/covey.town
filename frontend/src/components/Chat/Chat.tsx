import { Box, Button, Flex, Input, useToast } from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react';
import { emojify } from 'node-emoji';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import ChatMessage, { MessageProps } from './ChatMessage';
import Censorer from '../../classes/censorship/Censorer';

function Chat(): JSX.Element {
  const [messagesState, setMessagesState] = useState<MessageProps[]>([]);
  const [input, setInput] = useState<string>('');
  const [privateUsername, setPrivateUsername] = useState<string>('');
  useVideoContext();
  const { userName, currentTownID, myPlayerID, players, apiClient, messages } = useCoveyAppState();
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

  // const messageToProps = (message: AChatMessage): MessageProps => {
  //   if(message) {
  //     const sender = players.find(p => p.id === message.senderID)
  //     console.log(sender?.userName)
  //     console.log(messages[messages.length-1].message)
  //     return {
  //       key: nanoid(),
  //       userName: `${sender?.userName}: `,
  //       color: setButtonColor('global'),
  //       message: messages[messages.length-1].message,
  //     }
  //   }
  //   throw new Error();
  // }

  // const getMessages = useCallback((async ()=> {
  //   const messagesCurrent = (await apiClient.getMessages({coveyTownID: currentTownID})).messages;
  //   setMessagesState(messagesCurrent.map(msg => messageToProps(msg)))
  // }), [apiClient, currentTownID, messageToProps])

  useEffect((()=> {
    if(!messages) {
      toast({
        title: 'Messages is undefined',
        status: 'error',
      });
      return;
    }

    if(messages.length !== 0) {
      const sender = players.find(p => p.id === messages[messages.length-1].senderID)
      if(messages[messages.length-1].getType() === 'global') {
        setMessagesState([
          ...messagesState,
          {
            key: nanoid(),
            userName: `${sender?.userName}`,
            color: setButtonColor('global'),
            message: messages[messages.length-1].message,
          },
        ])
      } else if (messages[messages.length-1].getType() === 'private') {
        const receiver = players.find(p => p.id === myPlayerID)
        if(messages[messages.length-1].getReceiverID() === myPlayerID) {
          setMessagesState([
            ...messagesState,
            {
              key: nanoid(),
              userName: `${sender?.userName} to ${receiver?.userName}`,
              color: setButtonColor('private'),
              message: messages[messages.length-1].message,
            },
          ])
        }
      }
      
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [userName, messages, toast])

  const handlePrivateMessage = async () => {
    if (input !== '') {
      const censoredInput = Censorer.censorMessage(input);
      const emojifiedInput = emojify(censoredInput);
      try {
        const toPlayer = players.find(p => p.userName === privateUsername);
          if (toPlayer) {
          await apiClient.sendPrivatePlayerMessage({
            coveyTownID: currentTownID,
            userIDFrom: myPlayerID,
            userIDTo: toPlayer.id,
            message: emojifiedInput,
          });

          setMessagesState([
            ...messagesState,
            {
              key: nanoid(),
              userName: `${userName} to ${privateUsername}`,
              color: setButtonColor('private'),
              message: emojifiedInput,
            },
          ]);
          setInput('');
        } else {
          toast({
            title: 'Player does not exist',
            status: 'error',
          });
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
      const censoredInput = Censorer.censorMessage(input);
      const emojifiedInput = emojify(censoredInput);
      try {
            await apiClient.sendGlobalPlayerMessage({
              coveyTownID: currentTownID,
              coveyUserID: myPlayerID,
              message: emojifiedInput,
            });
            setMessagesState([
              ...messagesState,
              { key: nanoid(), userName, color: setButtonColor('global'), message: emojifiedInput },
            ]);
          // do toasts if message is not sent
          setInput('');
      } catch (err) {
        toast({
          title: 'Message unable to send',
          description: err.toString(),
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
          {messagesState.map(msg => (
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
