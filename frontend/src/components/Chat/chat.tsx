import React, { useEffect, useState } from 'react';

import {
  Backdrop,
  CircularProgress,
  Container,
  CssBaseline,
  Grid,
  IconButton,
  List,
  ListItem,
  makeStyles,
  TextField,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import Client from 'twilio-chat';
import { Channel } from 'twilio-chat/lib/channel';
import useCoveyAppState from '../../hooks/useCoveyAppState';





interface ChatProps {
    token: string,
    broadCastChannelSID: string
}

const useStyles = makeStyles(() => ({
  textField: { width: "100%", borderWidth: 0, borderColor: "transparent" },
  textFieldContainer: { flex: 1, marginRight: 12 },
  gridItem: { paddingTop: 12, paddingBottom: 12 },
  gridItemChatList: { overflow: "auto", height: "70vh" },
  gridItemMessage: { marginTop: 12, marginBottom: 12 },
  sendButton: { backgroundColor: "#3f51b5" },
  sendIcon: { color: "white" },
  mainGrid: { paddingTop: 100, borderWidth: 1 },
  author: { fontSize: 10, color: "gray" },
  timestamp: { fontSize: 8, color: "white", textAlign: "right", paddingTop: 4 },
}));

export default function ChatWindow(): JSX.Element {
    const { textField, textFieldContainer, gridItem, gridItemChatList, gridItemMessage, sendButton, sendIcon, mainGrid,
        author, timestamp } = useStyles();
    const { players, videoToken, broadcastChannelSID, myPlayerID } = useCoveyAppState();
    const [client, setClient] = useState<Client>();
    const [channel, setChannel] = useState<Channel>();
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [messages, setMessages] = useState<{id: string, author: string, body: string, dateCreated: any}[]>([]);

    const styles = {
        listItem: (isOwnMessage: boolean) => ({
            flexDirection: 'column' as const,
            alignItems: isOwnMessage ? "flex-end" : "flex-start",
        }),
        container: (isOwnMessage: boolean) => ({
            maxWidth: "75%",
            borderRadius: 12,
            padding: 16,
            color: "white",
            fontSize: 12,
            backgroundColor: isOwnMessage ? "#054740" : "#262d31",
        }),
    };

    useEffect(() => {
        Client.create(videoToken).then(newClient => {
            setClient(newClient)
            newClient.getChannelBySid(broadcastChannelSID).then(broadcastChannel => {
                setChannel(broadcastChannel)
                broadcastChannel.join().then(joinedChannel => joinedChannel.on('messageAdded', (newMessage) => {
                    const player = players.find((p) => p.id === newMessage.author);
                    messages.push({id: newMessage.author, author: player?.userName || '', body: newMessage.body, dateCreated: newMessage.dateCreated});
                    setMessages(messages);

                }))
            }
            )
        })
    }, [videoToken, broadcastChannelSID])

    const handleMessageChange = async (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setMessage(event.target.value);
    }

    const handleMessage = async () => {
        channel?.sendMessage(message).then(num => setMessage(''))
    }

    return (
        <Container component="main" maxWidth="md">
            <Backdrop open={loading} style={{ zIndex: 99999 }}>
                <CircularProgress style={{ color: "white" }} />
            </Backdrop>

            <CssBaseline />

            <Grid container direction="column" className={mainGrid}>
                <Grid item className={gridItemChatList}>
                    <List dense>
                        {messages &&
                            messages.map((text) => (
                                <ListItem key={text.author} style={styles.listItem(text.id === myPlayerID)}>
                                    <div className={author}>{text.author}</div>
                                    <div style={styles.container(text.id === myPlayerID)}>
                                    {text.body}
                                    <div className={timestamp}>
                                        {new Date(text.dateCreated.toISOString()).toLocaleString()}
                                    </div>
                                    </div>
                                </ListItem>
                            ))}
                    </List>
                </Grid>

                <Grid item className={gridItemMessage}>
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center">
                        <Grid item className={textFieldContainer}>
                            <TextField
                                id="broadcastchatfield"
                                required
                                className={textField}
                                placeholder="Enter message"
                                variant="outlined"
                                value={message}
                                multiline
                                rows={2}
                                disabled={!channel}
                                onChange={handleMessageChange}
                            />
                        </Grid>
                        
                        <Grid item>
                            <IconButton
                                className={sendButton}
                                onClick={handleMessage}
                                disabled={!channel}>
                                <Send className={sendIcon} />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
   );
}