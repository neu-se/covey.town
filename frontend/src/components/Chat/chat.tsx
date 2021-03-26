import React, { useEffect, useState } from 'react';


interface ChatProps {
    token: string,
    broadCastChannelSID:string
}

export default function ChatWindow({ token,broadCastChannelSID }: ChatProps): JSX.Element {

    
    

    return <h1>Hello ${token} ${broadCastChannelSID}</h1>

}