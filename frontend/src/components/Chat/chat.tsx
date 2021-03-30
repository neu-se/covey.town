import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    Table,
    TableCaption,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useToast
} from '@chakra-ui/react';
import { nanoid } from 'nanoid';

import Client from 'twilio-chat';
import { Channel } from 'twilio-chat/lib/channel';
import useCoveyAppState from '../../hooks/useCoveyAppState';





interface ChatProps {
    token: string,
    broadCastChannelSID: string
}

export default function ChatWindow(): JSX.Element {



    const { videoToken, broadcastChannelSID } = useCoveyAppState();

    const [client, setClient] = useState<Client>();
    const [channel, setChannel] = useState<Channel>();

    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        Client.create(videoToken).then(newClient => {
            setClient(newClient)
            newClient.getChannelBySid(broadcastChannelSID).then(broadcastChannel => {
                setChannel(broadcastChannel)
                broadcastChannel.join().then(joinedChannel => joinedChannel.on('messageAdded', (newMessage) => {
                    console.log(`Author: + ${newMessage.author}`);
                    console.log(`message:' + ${newMessage.body}`);

                }))
            }
                // newClient?.getChannelBySid(broadcastChannelSID).then(channel => {
                //     console.log(`channel name ${channel.uniqueName} ${channel.friendlyName}`)
                //     channel.join().then(channel1 =>
                //         channel1.sendMessage(`hello ${nanoid(5)}`).then(num => {
                //             channel1.getMessages().then(messages => {
                //                 const totalMessages = messages.items.length;
                //                 for (let i = 0; i < totalMessages; i += 1) {
                //                     const message = messages.items[i];
                //                     console.log(`Author: + ${message.author}`);
                //                 }
                //                 console.log(`Total Messages:' + ${totalMessages}`);
                //             })
                //         })

                //     )
                // }
                // )

            )
        }


        )
    }, [videoToken, broadcastChannelSID])


    const handleMessage = async () => {
        channel?.sendMessage(message).then(num => setMessage(''))
    }

    return <div>
        <form>
            <Stack>
                <Box p="4" borderWidth="1px" borderRadius="lg">

                    <FormControl>
                        <FormLabel htmlFor="name">Message</FormLabel>
                        <Input autoFocus name="name" placeholder="Your name"
                            value={message}
                            onChange={event => setMessage(event.target.value)}
                        />
                    </FormControl>
                    <button type='submit' onClick={handleMessage}>Send</button>
                </Box>
            </Stack>
        </form>

    </div>
}