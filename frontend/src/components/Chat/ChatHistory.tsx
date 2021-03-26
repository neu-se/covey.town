import React,{ FC, useEffect, useState } from 'react';
import useCoveyAppState from '../../hooks/useCoveyAppState';

// interface IProps {
//     townId: string
//     receiverId: string
//     senderId: string
//   }

export default function ChatHistory(props: { coveyTownID: string, receiverID: string, senderID: string }) {
    const {coveyTownID, receiverID, senderID} = props;
    const { apiClient} = useCoveyAppState();
    const [chatHistory, setChatHistory] = useState([
        {
            senderName: '',
            senderID: '',
            receiverName: '',
            receiverID: '',
            roomName: '',
            roomID: '',
            content: '',
            time: '',
        }
    ]);

    // useEffect(() => {
    //     async function getChatHistory() {
    //         const result = await apiClient.getChatHistory({
    //             coveyTownID, receiverID, senderID
    //         });
    //         const {messages} = result;
    //         messages.sort((a,b) => a.time-b.time);
    //         setChatHistory(messages);
    //     };
    //     getChatHistory().then();
    // }, [apiClient])

    // useEffect(() => {
    //     async function getChatHistory() {
    //         const result = await apiClient.getChatHistory({
    //             coveyTownID, receiverID, senderID
    //         });
    //         const {messages} = result;
    //         messages.sort((a,b) => a.time-b.time);
    //         setChatHistory(messages);
    //     };
    //     const interval = setInterval(() => {
    //         getChatHistory().then()
    //     }, 1000)
    //     return ()=> clearInterval(interval);
    // }, [apiClient])

    return(
        <div>
            <div>History</div>
            <div>{coveyTownID}</div>
            <div>{receiverID}</div>
            <div>{senderID}</div>
        </div>

    );
}
// const ChatHistory = ({townId, receiverId, senderId} : IProps) => {

// }

// export default ChatHistory;
