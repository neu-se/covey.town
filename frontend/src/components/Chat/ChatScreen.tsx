import React, { useEffect , useState, useRef } from "react";
import { Socket } from 'socket.io-client';
import { Select } from '@chakra-ui/react';
import useCoveyAppState from "../../hooks/useCoveyAppState";
import './ChatScreen.css';

const NEW_CHAT_MESSAGE_EVENT = "groupMessage"; // Name of the event
// const SOCKET_SERVER_URL = "http://localhost:8081";

const useChat = (coveyTownID : string, socket: Socket) => {
  const [messages, setMessages] = useState<MsgFormat[]>([]); // Sent and received messages
  const socketRef = useRef(socket);

  useEffect(() => {

    // Listens for incoming messages
    socketRef?.current?.on(NEW_CHAT_MESSAGE_EVENT, (message: any) => {
      const incomingMessage = {
        ...message,
        ownedByCurrentUser: message.senderId === socketRef.current?.id,
      };
      setMessages((msgs) => [...msgs, incomingMessage]);
    });
    
    // Destroys the socket reference
    // when the connection is closed
    // return () => {
    //   socketRef.current.disconnect();
    // };
  }, [coveyTownID]);

  // Sends a message to the server that
  // forwards it to all users in the same room
  const sendMessage = (messageBody : string) => {
    socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {
      body: messageBody,
      senderId: socketRef.current.id,
    });

    // socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, messageBody) ;

  };

  return { messages, sendMessage };
};

type MsgFormat = {
  body: string,
  senderId: string,
}


const ChatScreen = () => {
    
  const {
    players, myPlayerID, currentTownID, socket
  } = useCoveyAppState();

  const [newMessage, setNewMessage] = useState('');
  const [receiver, setReceiver] = useState('everyone');
  const { messages, sendMessage } = useChat(currentTownID, socket as Socket);


  console.log("messages", messages);

  const handleSubmit = (e: any) =>  {
    e.preventDefault();
    sendMessage(newMessage);
    // if(receiver ===  'everyone') {
    //   sendMessage(newMessage);
    //     // send to all
    // } else {
    //   // send to receiver player id 
    // }
    // // reset message to empty once sent
    setNewMessage(''); 

  }

  return (
    <div>
      <body>
        <div className='heading'>Chat Box</div>
        <div className='mbox'>
          <Select onChange={(e) => setReceiver(e.target.value)}>
            <option value="everyone">Everyone</option>
            {players.filter(player => player.id !== myPlayerID).map(player => <option key={player.userName}  value={player.id}> {player.userName} </option>)}
          </Select>
          <ol>
            text
            twq
          {messages.map((message) => (
            <li
              key={JSON.stringify(message)}
              // className={`message-item ${
              //   message.ownedByCurrentUser ? "my-message" : "received-message"
              // }`}
            >
              {message.body}
            </li>
          ))}
        </ol>
        </div>
        <form id="form">
          <input id="input" placeholder="Write message..." onChange={(e) => setNewMessage(e.target.value)} />
          <button type='submit' onClick={(e)=> handleSubmit(e)}>Send</button>
        </form>
      </body>
    </div>
  );
};
export default ChatScreen;
