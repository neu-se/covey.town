import React, { useEffect, useState, useRef } from "react";
import { Socket } from 'socket.io-client';
import {
  IconButton, ListItem, TextField,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import { Select } from '@chakra-ui/react';
import useCoveyAppState from "../../hooks/useCoveyAppState";
import './ChatScreen.css';
import { Message } from "../../CoveyTypes";


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


const ChatScreen = () => {

  const {
    players, myPlayerID, currentTownID, socket, userName,
  } = useCoveyAppState();

  const [newMessage, setNewMessage] = useState('');
  const [receiver, setReceiver] = useState('everyone');
  const { messages, sendMessage } = useChat(currentTownID, socket as Socket);
  const styles = {
    textField: { width: "100%", borderWidth: 0, borderColor: "transparent" },
    sendButton: { backgroundColor: "#3f51b5" },
    sendIcon: { color: "white" },
  } as const;

  const handleSubmit = (e: any) => {
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
      padding: 16,
      color: "white",
      fontSize: 12,
      backgroundColor: isOwnMessage ? "#054740" : "#262d31",
    }),
    author: { fontSize: 10, color: "gray" },
    timestamp: { fontSize: 8, color: "white", textAlign: "right", paddingTop: 4 } as const,
  };

  return (
    <div>
      <body>
        <div className='heading'>Chat Box</div>
        <div className='mbox'>
          <Select onChange={(e) => setReceiver(e.target.value)}>
            <option value="everyone">Everyone</option>
            {players.filter(player => player.id !== myPlayerID).map(player => <option key={player.userName} value={player.id}> {player.userName} </option>)}
          </Select>
          <ol>
            {messages.map((message) => (
              <ListItem
                key={JSON.stringify(message)}
                style={estyles.listItem(message.ownedByCurrentUser)}>
                <div style={estyles.author}>{message.userName}</div>
                <div style={estyles.container(message.ownedByCurrentUser)}>
                  {message.body}
                  {/* <div style={estyles.timestamp}>
                  {message.dateCreated.toISOString()}
                </div> */}
                </div>
              </ListItem>
            ))}
          </ol>
        </div>
        <form id="form">
          <input id="input"
            placeholder="Write message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)} />
          {/* <button type='submit' onClick={(e)=> handleSubmit(e)}>Send</button> */}
          <IconButton
            style={styles.sendButton}
            onClick={(e) => handleSubmit(e)}
          >
            <Send style={styles.sendIcon} />
          </IconButton>
        </form>
      </body>
    </div>
  );
};
export default ChatScreen;
