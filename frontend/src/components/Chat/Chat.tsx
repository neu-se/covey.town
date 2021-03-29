import { Button, Input, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Dropdown, { Option } from 'react-dropdown';
import 'react-dropdown/style.css';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import ChatHistory from './ChatHistory';


export default function Chat(): JSX.Element {
    const toast = useToast();
    const { apiClient, currentTownID, players, socket, myPlayerID, currentTownFriendlyName, userName} = useCoveyAppState();
    const [message, setMessage] = useState<string>('');
    const [receiverName, setReceiverName] = useState<string>('');
    const [receiverID, setReceiverID] = useState<string>('');

    const sendHandler = async () => {
        try {
          const timeStamp = new Date().toString();
          await apiClient.sendMessage({senderName: userName, senderID: myPlayerID, receiverName, receiverID, roomName: currentTownFriendlyName, roomID: currentTownID, content: message, time: timeStamp});
          toast({
            title: 'Message sent',
            status: 'success'
          })
          const data = {senderName: userName, senderID: myPlayerID, receiverName, receiverID, roomName: currentTownFriendlyName, roomID: currentTownID, content: message, time: timeStamp}
          console.log(data);
          socket?.emit('playerSendMessage', data);
        } catch (err) {
            console.log(err);
        }
      }

    const options = players.map((player) => ({
        value: player.id,
        label: player.userName,
      }) 
    );
    const everyOne = {
      value: 'Everyone',
      label: 'Everyone',
    }
    const updatedOptions = options.filter(option => option.value !== myPlayerID).concat(everyOne);

    const onOptionSelected = (event: Option) => {
      const id = event.value;
      setReceiverID(id);
      const idToName = players.find(user => user.id === id)?.userName;
      if(idToName){
        setReceiverName(idToName);
      }else {
        setReceiverName('Everyone');
      }
    }

    return (
      <div>

        <Popup contentStyle={{width: "50%"}} trigger={<Button style = {{color: "#b98043", backgroundColor: "#f8ddb2", border: "1px solid"}} value="triggerChat">Chat</Button>} position="left center">
          <ChatHistory coveyTownID = {currentTownID} componentSenderID = {myPlayerID} componentReceiverID = {receiverID || 'Everyone'}/>
          <div>
            <Input
                  id='Message'
                  placeholder="Message"
                  name="message"
                  type='text'
                  pattern="[^\s]+"
                  value={message}
                  onChange={(event => setMessage(event.target.value))}
                />
            <Dropdown options={updatedOptions} onChange={event => onOptionSelected(event)} value={receiverName || 'Everyone'} placeholder="Select a Receiver" />

            <Button data-testid='sendbutton'
                    colorScheme="orange"
                    mr={3}
                    value="send"
                    onClick={sendHandler}>Send</Button>
          </div>
        </Popup>
      </div>
    );

 }

