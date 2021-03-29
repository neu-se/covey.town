import React,{ FC, useCallback, useEffect, useState } from 'react';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import { MessageData } from './MessageData';
import './ChatHistory.css';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function ChatHistory(props: { coveyTownID: string, componentReceiverID: string, componentSenderID: string }) {
    const {coveyTownID, componentReceiverID, componentSenderID} = props;
    const { apiClient} = useCoveyAppState();
    const [chatHistory, setChatHistory] = useState<MessageData[]>();

    const updateChatHistory = useCallback(() => {
        // console.log(apiClient);
        apiClient.getChatHistory({coveyTownID})
          .then((chats) => {
            setChatHistory(chats.chats);
          })
      }, [setChatHistory, apiClient, coveyTownID]);

    useEffect(() => {
    updateChatHistory();
    const timer = setInterval(updateChatHistory, 1000);
    return () => {
        clearInterval(timer)
    };
    }, [updateChatHistory]);

    const renderMessage = (message: MessageData) => {
        const {senderID, senderName, receiverID, content, time} = message;
        const messageFromMeToReceiver = (senderID === componentSenderID && receiverID === componentReceiverID);
        const messageFromReceiverToMe = (receiverID === componentSenderID && senderID === componentReceiverID);
        let className;
        if (messageFromMeToReceiver) {
            className = "Messages-message currentMember";
        }else if (messageFromReceiverToMe) {
            className = "Messages-message";
        }else {
            className = "hidden";
        }

        return (
            <li className={className}>
            <div className="Message-content">
                <div className="username">{senderName}</div>
                <div className="text">{content}</div>
                <div className="time">{time}</div>
            </div>
            </li>
        )
    }

    const chatHisComponent = componentReceiverID === '' ? null : <ul className="Messages-list">{chatHistory?.map(m => renderMessage(m))}</ul>

    return(
        <div>
            {chatHisComponent}
        </div>

    );
}

