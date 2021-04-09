import React, { Component, useState } from "react";
import { Select } from '@chakra-ui/react';
import useCoveyAppState from "../../hooks/useCoveyAppState";
import './ChatScreen.css';


const ChatScreen = () => {
  const [inputMsg, setInputMsg] = useState('');

  const [receiver, setReceiver] = useState('everyone');

  const {
    players, myPlayerID, socket
  } = useCoveyAppState();

  console.log("myPlayerID", myPlayerID);

  const handleSubmit = () =>  {
    if(receiver ===  'everyone') {
        // send to all
    } else {
      // send to receiver player id 
    }
    // reset message to empty once sent
    setInputMsg(''); 

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
        </div>
        <form id="form" onSubmit={()=> handleSubmit()}>
          <input id="input" autoComplete="off" onChange={(e) => setInputMsg(e.target.value)} />
          <button type='submit'>Send</button>
        </form>
      </body>
    </div>
  );
};
export default ChatScreen