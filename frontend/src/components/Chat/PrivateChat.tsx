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
import Player from '../../classes/Player';

import useCoveyAppState from '../../hooks/useCoveyAppState';



export default function PrivateChatWindow(): JSX.Element {



    const { videoToken, broadcastChannelSID, players } = useCoveyAppState();

    const [currentPlayers,setPlayers] = useState<Player[]>(players)
    const [client, setClient] = useState<Client>();
    const [channel, setChannel] = useState<Channel>();

    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        console.log('use effect being called')
        Client.create(videoToken).then(newClient => {
            setClient(newClient)
            newClient.getChannelBySid(broadcastChannelSID).then(broadcastChannel => {
                setChannel(broadcastChannel)
                broadcastChannel.join().then(joinedChannel => joinedChannel.on('messageAdded', (newMessage) => {
                    console.log(`Author: + ${newMessage.author}`);
                    console.log(`message:' + ${newMessage.body}`);

                }))
            }

            )
        }
        )
        return () => {
            console.log("chat component is unmounted")
          }
    }, [videoToken, broadcastChannelSID])


    const handleMessage = async () => {
        channel?.sendMessage(message).then(num => setMessage(''))
    }

    return <div>
        <form>
            <Stack>
                <Box p="4" borderWidth="1px" borderRadius="lg">

                    <FormControl>
                        <FormLabel htmlFor="message">Message</FormLabel>
                        <Input autoFocus name="message" placeholder="Your message"
                            value={message}
                            onChange={event => setMessage(event.target.value)}
                        />
                    </FormControl>
                    <Button onClick={handleMessage}>Send</Button>
                </Box>
            </Stack>
            <Table>
                <TableCaption placement="bottom">Publicly Listed Towns</TableCaption>
                <Thead><Tr><Th>User Name</Th></Tr></Thead>
                <Tbody>
                  {players?.map((player) => (
                    <Tr key={player.id}><Td role='cell'>{player.userName}</Td>
                        <Button onClick={() => console.log("message")}>Message</Button></Tr>
                  ))}
                </Tbody>
              </Table>
        </form>
    </div>
}