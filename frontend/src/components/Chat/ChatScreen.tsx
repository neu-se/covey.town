import React, { useState, useRef } from "react";
import { Socket } from 'socket.io-client';
import { IconButton, ListItem } from "@material-ui/core";
import { Send } from "@material-ui/icons";
import { ChatIcon } from '@chakra-ui/icons';
import { Select, Button, Stack } from '@chakra-ui/react';
import useCoveyAppState from "../../hooks/useCoveyAppState";
import './ChatScreen.css';
import useMaybeVideo from "../../hooks/useMaybeVideo";

const useChat = (coveyTownID: string, socket: Socket) => {
  const socketRef = useRef(socket);

  const {
    userName,
    messages,
    myPlayerID
  } = useCoveyAppState();

  const sendMessage = (messageBody: string, isBroadcast: boolean, receiver: string) => {
    socketRef.current.emit("playerChatted", {
      body: messageBody,
      senderId: myPlayerID,
      ownedByCurrentUser: true,
      userName,
      dateCreated: new Date(),
      isBroadcast,
      receiverId: receiver,
    }); 
  };
  return { messages, sendMessage };
};


const ChatScreen: any = () => {

  const {
    players, myPlayerID, currentTownID, socket, nearbyPlayers
  } = useCoveyAppState();

  const [newMessage, setNewMessage] = useState('');
  const [receiver, setReceiver] = useState('everyone');
  const { messages, sendMessage } = useChat(currentTownID, socket as Socket);
  const styles = {
    textField: { width: "100%", borderWidth: 0, borderColor: "transparent" },
    sendButton: { backgroundColor: "black" },
    sendIcon: { color: "white" },
  } as const;
  const video = useMaybeVideo();

  const handleSubmit = (e:any) => {
    e.preventDefault();
    if(receiver === "everyone"){
      sendMessage(newMessage, true, "");
    }
    else{
      sendMessage(newMessage, false, receiver);
    }
    setNewMessage('');
  }

  const estyles = {
    listItem: (isOwnMessage: boolean) => ({
      flexDirection: "column",
      alignItems: isOwnMessage ? "flex-end" : "flex-start",
    }) as const,
    container: (isOwnMessage: boolean) => ({
      maxWidth: "75%",
      borderRadius: 12,
      padding: 8,
      color: "white",
      fontSize: 14,
      backgroundColor: isOwnMessage ? "#054740" : "#262d31",
    }),
    author: { fontSize: 10, color: "gray" },
    timestamp: { fontSize: 8, color: "white", textAlign: "right", paddingTop: 4 } as const,
  };

  return (
    <div>
      <body>
        <div className='heading'>Chat Box</div>
        {nearbyPlayers?.nearbyPlayers.length !== 0 &&
          <>
            <h1 style={{paddingTop: 5, paddingBottom: 5, textAlign: "center", fontWeight: "bold"}}>Chat with nearby players: </h1>
            <Stack style={{paddingBottom: 5, paddingLeft: 5}} direction="row" spacing={3} align="center">
              {nearbyPlayers.nearbyPlayers.map(player => <Button rightIcon={<ChatIcon/>} colorScheme="teal" size="sm" key={player.userName} onClick={() => setReceiver(player.userName)}> {player.userName} </Button>)}
            </Stack>
          </>
        }
        <div className='selectPlayer'>
          <Select onChange={(e) => setReceiver(e.target.value)} value={receiver}>
            <option value="everyone">Everyone</option>
            {players.filter(player => player.id !== myPlayerID).map(player => <option key={player.userName} value={player.userName}> {player.userName} </option>)}
          </Select>
        </div>
        <div className='mbox'>
          <ol>
            {messages.map((message) => (
              <ListItem
                key={JSON.stringify(message)}
                style={estyles.listItem(message.ownedByCurrentUser)}>
                <div style={estyles.author}>{message.userName}</div>
                <div style={estyles.container(message.ownedByCurrentUser)}>
                  {message.body}
                </div>
                <div style={estyles.author}>{message.dateCreated}</div>
              </ListItem>
            ))}
          </ol>
        </div>
        <form id="form" noValidate autoComplete="off">
          <input id="input"
            placeholder="Write message..."
            value={newMessage}
            onFocus={()=>video?.pauseGame()}
            onBlur={()=>video?.unPauseGame()}
            onKeyPress={e => {
              if(e.key === 'Enter'){
                if(newMessage.length>0)
                  handleSubmit(e);
                else
                  e.preventDefault();
              }
            }}
            onChange={(e) => setNewMessage(e.target.value)} 
            />
          <IconButton
            style={styles.sendButton}
            disabled={!newMessage}
            onClick={(e) => handleSubmit(e)}>
            <Send style={styles.sendIcon} />
          </IconButton>
        </form>
      </body>
    </div>
  );
};
export default ChatScreen;
