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
        let messageFromMeToReceiver;
        let messageFromReceiverToMe;
        let messagePublic;
        if(componentReceiverID === 'Everyone'){
            messagePublic = (receiverID === 'Everyone');
            messageFromMeToReceiver = (messagePublic && senderID === componentSenderID);
            messageFromReceiverToMe = (messagePublic && senderID !== componentSenderID);
        } else {
            messagePublic = (receiverID === 'Everyone');
            messageFromMeToReceiver = (!messagePublic && senderID === componentSenderID && receiverID === componentReceiverID);
            messageFromReceiverToMe = (!messagePublic && receiverID === componentSenderID && senderID === componentReceiverID);
        }
        
        let className;
        if (messageFromMeToReceiver) {
            className = "Messages-message currentMember";
        }else if (messageFromReceiverToMe) {
            className = "Messages-message";
        }else {
            return null;
        }

        return (
            <li className={className}>
            <div className="Message-content">
                <div className="username">{senderName}</div>
                <div className="text">{content}</div>
                <div className="time">{time.split('GMT')[0]}</div>
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

