import React, {useCallback, useEffect, useState} from 'react';
import axios from 'axios';
import Client from 'twilio-chat';
import {Channel} from 'twilio-chat/lib/channel';
import {Box, Button, Input, Stack, Table, Tbody, Td, Tr} from "@chakra-ui/react";

import useCoveyAppState from "../../hooks/useCoveyAppState";

type Message = {
  state: {
    author: string
    body: string
    sid: string
  }
};



export default function ChatScreen(): JSX.Element {
  const [text, setText] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [channel, setChannel] = useState<Channel>();

  const { currentTownID, userName } = useCoveyAppState()

  // TODO We should probably create a client to communicate to the Chat Backend
  const getToken = async (email: string) => {
    const response = await axios.get(`http://localhost:3003/token/${email}`);
    const { data } = response;
    return data.token;
  };


  const handleMessageAdded = (messageToAdd: Message) => {
    const message :Message = {
      state: {
        author: messageToAdd.state.author,
        body: messageToAdd.state.body,
        sid: messageToAdd.state.sid,
      },
    }
    // setMessages(messages ? [...messages, message] : [message])
    setMessages(oldMessages => [...oldMessages, message]);
    console.log('messages', messages)
    console.log('message', message)
    // setMessages(messages ? [...messages, messageToAdd] : [messageToAdd])
    // messages.push(messageToAdd)
    console.log(messages)

  }

  const joinChannel = useCallback(async (channelToJoin) => {
    if (channelToJoin.channelState.status !== "joined") {
      await channelToJoin.join();
    }
    console.log('messages in joinChannel', messages)
    channelToJoin.on("messageAdded", handleMessageAdded);

  },[handleMessageAdded, messages]);


  // const scrollToBottom = () => {
  //   const scrollHeight = this.scrollDiv.current.scrollHeight;
  //   const height = this.scrollDiv.current.clientHeight;
  //   const maxScrollTop = scrollHeight - height;
  //   this.scrollDiv.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  // };

  const sendMessage =() => {
    console.log(messages)
    if (text && String(text).trim()) {
      // this.setState({ loading: true });
      setLoading(true)
      // channel && channel.sendMessage(text);

      if (channel) {
        channel.sendMessage(text)
      }
      // channel?.sendMessage(text)
      // this.setState({ text: "", loading: false });
      setText("");
      setLoading(false);
    }
  }

  const loginToChat = useCallback(async () => {

    let token = '';
    setLoading(true)

    try {
      token = await getToken(userName);
    } catch {
      throw new Error("unable to get token, please reload this page");
    }

    const client = await Client.create(token);

    client.on("tokenAboutToExpire", async () => {
      const token1 = await getToken(userName);
      await client.updateToken(token1);
    });

    client.on("tokenExpired", async () => {
      const token2 = await getToken(userName);
      await client.updateToken(token2);
    });

    client.on("channelJoined", async (channelToJoin) => {
      // getting list of all messages since this is an existing channel
      const mes = await channelToJoin.getMessages();
      console.log('channeljoined has occured')


      const mes2 : Message[] = mes.items.map((message: Message) => ({
        state: {
          body: message.state.body,
          sid: message.state.sid,
          author: message.state.author
        }
      }))
      setMessages(mes2)
    });

    try {
      const channelToJoin = await client.getChannelByUniqueName('general');
      await joinChannel(channelToJoin);
      setChannel(channelToJoin)

    } catch {
      try {

        // const channelToJoin = await client.createChannel({
        //   uniqueName: 'general',
        //   friendlyName: 'general',
        // });
        // await joinChannel(channelToJoin);
        // setChannel(channelToJoin)
        // setLoading(false)
        //
        // console.log('channel', channel);
        // console.log('messages', messages);
      } catch {
        throw new Error('unable to create channel, please reload this page');
      }
    }
  }, [joinChannel, userName])



  // useEffect( () => {
  //   loginToChat()
  // }, [loginToChat]);


  return (
    <>
      <Stack>
      <Box maxH="500px" overflowY="scroll">
      <Table>
        <Tbody>
      {messages.map((message) =>
        <Tr key={message.state.sid}>
          <Td role='cell'>{message.state.author}:</Td>
          <Td role='cell'>{message.state.body} </Td>
        </Tr>

      )}
        </Tbody>
      </Table>

      </Box>
      <Input autoFocus name="name" placeholder=""
             onChange={(event) => setText(event.target.value)}
             value={text}
      />
      <Button onClick={sendMessage} disabled={!channel || !text}>Send</Button>
      <Button onClick={loginToChat} >Login to Chat</Button>
      </Stack>
    </>
  );


}

