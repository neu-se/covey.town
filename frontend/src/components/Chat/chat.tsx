import React, { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';

import Client from 'twilio-chat';
import useCoveyAppState from '../../hooks/useCoveyAppState';




interface ChatProps {
    token: string,
    broadCastChannelSID: string
}

export default function ChatWindow(): JSX.Element {



    const { videoToken, broadcastChannelSID } = useCoveyAppState();

    const [client, setClient] = useState<Client>();

    useEffect(() => {
        console.log("Helloooooooooooooo")
        Client.create(videoToken).then(newClient => {
            setClient(newClient)
            console.log("getChannel")
            client?.getChannelBySid(broadcastChannelSID).then(channel => {
                console.log(`channel name ${channel.uniqueName} ${channel.friendlyName}`)
                channel.join().then(channel1 =>
                    channel1.sendMessage(`hello ${nanoid(5)}`).then(num => {
                        channel1.getMessages().then(messages => {
                            const totalMessages = messages.items.length;
                            for (let i = 0; i < totalMessages; i += 1) {
                                const message = messages.items[i];
                                console.log(`Author: + ${message.author}`);
                            }
                            console.log(`Total Messages:' + ${totalMessages}`);
                        })
                    })

                )
            }
            )
        }


        )

    }, [videoToken, broadcastChannelSID])

    return <h1>Hello ${videoToken} ${broadcastChannelSID}</h1>

}