import React, {useState} from 'react';
import 'react-chatbox-component/dist/style.css';
import { ChatBox } from '../Chatbox';

export default function Chat(): JSX.Element {
  const [messages, setMessages] = useState([
    {
      "text": "Hello there",
      "id": "1",
      "sender": {
        "name": "Ironman",
        "uid": "user1",
        "avatar": "https://data.cometchat.com/assets/images/avatars/ironman.png",
      },
    },
  ])

  return (
    <ChatBox messages={messages} />
  )
}