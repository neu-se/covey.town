import React, { useState, useEffect } from "react";
import {
  AppBar,
  Backdrop,
  CircularProgress,
  Container,
  CssBaseline,
  Grid,
  IconButton,
  List,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import axios from "axios";
import ChatItem from "./ChatItem";
import { Message } from "../../CoveyTypes";
import { Channel } from 'twilio-chat/lib/channel';

interface ScreenProps{
  town: string
}

const ChatScreen: React.FunctionComponent<ScreenProps> = (props) => {
  const [playerName, setPlayerName] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [channel, setChannel] = useState<Channel>();
  const Chat = require("twilio-chat");
  const styles = {
    textField: { width: "100%", borderWidth: 0, borderColor: "transparent" },
    textFieldContainer: { flex: 1, marginRight: 12 },
    gridItem: { paddingTop: 12, paddingBottom: 12 },
    gridItemChatList: { overflow: "auto", height: "70vh" },
    gridItemMessage: { marginTop: 12, marginBottom: 12 },
    sendButton: { backgroundColor: "#3f51b5" },
    sendIcon: { color: "white" },
    mainGrid: { paddingTop: 100, borderWidth: 1 },
  } as const;
  const town: string = props.town;
  const scrollDiv = React.useRef(document.createElement("div"));

  useEffect(() => {
    const helper = async() => {
      // location
      let token: string = '';
      setLoading(true);
      try{
        token = await getToken(playerName);
      } catch {
        throw new Error("Unable to get token");
      }

      const client = await Chat.Client.create(token);

      client.on("tokenAboutToExpire", async() => {
        const token = await getToken(playerName);
        client.updateToken(token);
      })

      client.on("tokenExpired", async() => {
        const token = await getToken(playerName);
        client.updateToken(token);
      })

      client.on("channelJoined", async (channel: Channel) => {
        const existingMessages = await channel.getMessages();
        setMessages(existingMessages.items || []);
        scrollToBottom();
      })

      try{
        const channel = await client.getChannelByUniqueName(town);
        await joinChannel(channel);
        setChannel(channel);
        setLoading(false);
      } catch {
        try{
          const channel = await client.createChannel({
            uniqueName: town,
            friendlyName: town
          });
          await joinChannel(channel);
          setChannel(channel);
          setLoading(false);
        } catch {
          throw new Error("Unable to create channel");
        }
      }
    }
    helper();
  });

  // Utility functions 
  const joinChannel = async (channel: Channel) => {
    if (channel.status !== "joined") {
      await channel.join();
    }
    channel.on("messageAdded", handleMessageAdded);
  };

  const handleMessageAdded = (message: any) => {
      setMessages(!!messages ? [...messages, message]: [message]);
      scrollToBottom();
  };

  const scrollToBottom = () => {
      const height = scrollDiv.current.clientHeight;
      const maxScrollTop = scrollDiv.current.scrollHeight - height;
      scrollDiv.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  };
  
  const getToken = async (playerName: string) => {
    const response = await axios.get(`http://localhost:5000/token/${playerName}`);
    const { data } = response;
    return data.token;
  };

  const sendMessage = () => {
    if (text && String(text).trim()) {
      setLoading(true);
      channel && channel.sendMessage(text);
      setText("");
      setLoading(false);
    }
 };

 return <>
  <Container component="main" maxWidth="md">
    <Backdrop open={loading} style={{ zIndex: 99999 }}>
      <CircularProgress style={{ color: "white" }} />
    </Backdrop>
    <AppBar elevation={10}>
      <Toolbar>
        <Typography variant="h6">
          {`Town: ${town}, User: ${playerName}`}
        </Typography>
      </Toolbar>
    </AppBar>
    <CssBaseline />
      <Grid container direction="column" style={styles.mainGrid}>
        <Grid item style={styles.gridItemChatList} ref={scrollDiv}>
          <List dense={true}>
            {messages &&
              messages.map((message) => (
                <ChatItem
                  key={message.author}
                  message={message}
                  playerName={playerName}
                />
            ))}
          </List>
        </Grid>
      <Grid item style={styles.gridItemMessage}>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
        >
        <Grid item style={styles.textFieldContainer}>
        <TextField
          required
          style={styles.textField}
          placeholder="Enter message"
          variant="outlined"
          multiline
          rows={2}
          value={text}
          disabled={!channel}
          onChange={(event) => {
              setText(event.target.value);
            }
          }
        />
      </Grid>
      <Grid item>
        <IconButton
          style={styles.sendButton}
          onClick={sendMessage}
          disabled={!channel || !text}
        >
      <Send style={styles.sendIcon} />
      </IconButton>
      </Grid>
    </Grid>
    </Grid>
  </Grid>
  </Container>
</>
  
}

export default ChatScreen;