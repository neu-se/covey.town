import React, { useEffect, useState } from 'react';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import Client from 'twilio-chat';


interface ChatProps {
    token: string,
    broadCastChannelSID:string
}

export default function ChatWindow(): JSX.Element {

    

    const {videoToken,broadcastChannelSID} = useCoveyAppState();
    

    return <h1>Hello ${videoToken} ${broadcastChannelSID}</h1>

}