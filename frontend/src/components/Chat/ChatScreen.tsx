import React, { useState, useRef, SyntheticEvent } from "react";
import { Socket } from 'socket.io-client';
import Moment from 'moment';
import { IconButton, ListItem } from "@material-ui/core";
import { Send } from "@material-ui/icons";
import { Select, Button, Stack } from '@chakra-ui/react';
import useCoveyAppState from "../../hooks/useCoveyAppState";
import './ChatScreen.css';
import useMaybeVideo from "../../hooks/useMaybeVideo";

const useChat = (socket: Socket) => {
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
      userName,
      dateCreated: new Date().toISOString(),
      isBroadcast,
      receiverId: receiver,
    }); 
  };
  return { messages, sendMessage };
};


const ChatScreen: React.FunctionComponent = () => {

  const {
    players, myPlayerID, socket, nearbyPlayers
  } = useCoveyAppState();

  const [newMessage, setNewMessage] = useState('');
  const [receiver, setReceiver] = useState('everyone');
  const { messages, sendMessage } = useChat(socket as Socket);
  const styles = {
    textField: { width: "100%", borderWidth: 0, borderColor: "transparent" },
    sendButton: { backgroundColor: "black" },
    sendIcon: { color: "white" },
  } as const;
  const video = useMaybeVideo();

  const handleSubmit = (e:SyntheticEvent) => {
    e.preventDefault();
    if(receiver === "everyone"){
      sendMessage(newMessage, true, "");
    }
    else{
      const currReceiver = players.find(player => player.userName === receiver);
      sendMessage(newMessage, false, currReceiver?.id as string);
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
      backgroundColor: isOwnMessage ? "teal" : "black",
    }),
    author: { fontSize: 10, color: "gray" },
    private: { fontSize: 10, color: "red" },
    timestamp: { fontSize: 8, color: "white", textAlign: "right", paddingTop: 4 } as const,
  };

  return (
    <div>
      <body>
        <div className='heading'>Chat Box</div>
        <div className='selectPlayer'>
          <Select onChange={(e) => setReceiver(e.target.value)} value={receiver}>
            <option value="everyone">Everyone</option>
            {players.filter(player => player.id !== myPlayerID).map(player => <option key={player.userName} value={player.userName}> {player.userName} </option>)}
          </Select>
        </div>
        <div className='mbox'>
          <div>
            {nearbyPlayers?.nearbyPlayers.length !== 0 &&
              <div className='nearBy'>
                <h1 style={{paddingTop: 0, paddingBottom: 5, textAlign: "center", fontWeight: "bold"}}>Chat with nearby players: </h1>
                <div className='nearByBtn'>
                <Stack style={{paddingBottom: 5, paddingLeft: 5}} direction="row" spacing={3} align="center">
                  {
                  nearbyPlayers.nearbyPlayers.map(player => 
                    <Button variant="outline" 
                            colorScheme="teal" 
                            size="sm" 
                            key={player.userName} 
                            onClick={() => setReceiver(player.userName)}
                            style={{
                                  whiteSpace: "normal",
                                  wordWrap: "break-word",
                                  padding: "5px 5px",
                                  overflow: "auto",
                                  width: "auto",
                                  height: "auto",
                            }}
                    >
                      {player.userName}
                    </Button>
                    )
                  }
                </Stack>
                </div>
              </div>
            }
          </div>
          <ol>
            {messages.map((message) => (
              <ListItem
                key={JSON.stringify(message)}
                style={estyles.listItem(myPlayerID === message.senderId)}>
                <div style={message.isBroadcast ? estyles.author : estyles.private}>{message.userName}{message.isBroadcast ? '' : '(Private)'}</div>
                <div style={estyles.container(myPlayerID === message.senderId)}>
                  {message.body}
                </div>
                <div style={estyles.author}>{Moment(message.dateCreated).format('DD MMM hh:mm')}</div>
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
