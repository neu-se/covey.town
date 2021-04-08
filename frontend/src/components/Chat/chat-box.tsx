import React, { useEffect, useState } from "react";

import _escapeRegExp from 'lodash/escapeRegExp'
import _uniqBy from 'lodash/uniqBy'
import _clone from 'lodash/clone'


import {
  Box,
  Fab,
  FormGroup,
  Grid,
  InputLabel,
  ListItem,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import { Mention, MentionsInput } from 'react-mentions'
import { useToast } from '@chakra-ui/react';
import '../../App.css';
import { makeStyles } from "@material-ui/styles";
import SendIcon from '@material-ui/icons/Send';
import useCoveyAppState from "../../hooks/useCoveyAppState";
import PlayerMessage from "../../classes/PlayerMessage";
import PlayerMention, { ServerMentionMessage } from "../../classes/PlayerMention";
import MentionUser from "../../classes/MentionUser";
import useMaybeVideo from "../../hooks/useMaybeVideo";


const useStyles = makeStyles({
  root: {},
  chatbox: {
    position: 'absolute',
    top: '2%',
    right: '2%',
    // bottom: '70vh',
    background: '#efe4b1',
    width: '20vw',
    height: '71vh',
    borderRadius: '45px',
    // overflow: 'auto',
    scrollbarGutter: '10px'

  },
  chatHeader: {
    textAlign: 'center',
    background: '#4f4f4f',
    color: '#ffffff',
    borderTopLeftRadius: '45px',
    borderTopRightRadius: '45px'
  },
  fabIcon: {
    // width: '20%'
  },
  formControl: {},
  messageCreation: {
    justifyContent: 'between',
    float: 'right',
    top: 'flex-end'
  },
  mentionText: {
    color: '#1d2bff'
  },
  messageWindow: {
    height: '55vh',
    overflow: 'auto',
    flexWrap: 'nowrap'
  },
  messageBorder: {
    marginLeft: '5px',
    marginRight: '5px'
  },
  otherPlayerMessage: {
    float: 'left',
    textAlign: 'left'

  },
  otherPlayerMessageName: {
    color: '#1d2bff'
  },
  playerMessage: {
    alignItems: 'right',
    textAlign: 'left'
  },
  playerMessageName: {
    color: '#ff0c13'
  },

  textField: {
    width: '80%',
    background: '#efead6',
    marginLeft: '5px',
    marginRight: '5px'

  }

});


//  look up jss
//  look up default breakpoint
//  can do inline hover styling
const ChatBox = (): JSX.Element => {
  //  we would use an api call here to get messages, similar to town refresh
  //  api call- would change message state- may not need useEffect. useState and its rerender may be more effective
  const {
    messages,
    myPlayerID,
    userName,
    emitMessage,
    currentTownFriendlyName,
    players,
    socket
  } = useCoveyAppState();
  const [newText, setNewText] = useState<string>('')
  const [newRecipient, setNewRecipient] = useState<'town' | { recipientId: string }>('town');
  const classes = useStyles();
  const [users, setUsers] = useState<MentionUser []>([]);
  const video = useMaybeVideo();
  const onFocus = () => video?.pauseGame();
  const onBlur = () => video?.unPauseGame();
  const toast = useToast();

  useEffect(() => {
    setUsers(players.filter(p => p.id !== myPlayerID)
      .map(player => new MentionUser(player.id, player.userName)));
  }, [players])

  useEffect(() => {
    socket?.on('receivePlayerMention', (serverMessage: ServerMentionMessage) => {
      toast({
        title: `${serverMessage._senderName} mentioned you !`,
        status: 'success',
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const getDisplayTextFromMention = (text: string) => {
    let displayText: string = _clone(text)
    // eslint-disable-next-line no-useless-escape
    const tags: string[] = text.match(/@\{\{[^\}]+\}\}/gi) || []
    // eslint-disable-next-line array-callback-return
    tags.map(myTag => {
      const tagData = myTag.slice(3, -2)
      const tagDataArray = tagData.split('||')
      const tagDisplayValue = tagDataArray[1]
      displayText = displayText.replace(new RegExp(_escapeRegExp(myTag), 'gi'), `${tagDisplayValue} `)
    })
    return displayText;
  }

  const getIdsFromMention = (text: string) => {

    // eslint-disable-next-line no-useless-escape
    const tags: string[] = text.match(/@\{\{[^\}]+\}\}/gi) || []
    const allUserIds = tags.map(myTag => {
      const tagData = myTag.slice(3, -2)
      const tagDataArray = tagData.split('||')
      return {id: tagDataArray[0], display: tagDataArray[1]}
    })
    return _uniqBy(allUserIds, myUser => myUser.id)
  }


  const sendMessage = async (text: string) => {
    //  fixes bug that crashes server
    if (text.length === 0) {
      return;
    }
    // console.log(getIdsFromMention(text));
    const mentions: MentionUser[] = getIdsFromMention(text);

    mentions.forEach(mention => {
      socket?.emit('sendPlayerMention', new PlayerMention(
        myPlayerID,
        userName,
        mention.id,
        new Date(),
      ));

    });

    const displayText = getDisplayTextFromMention(text);


    emitMessage(new PlayerMessage(
      '',
      myPlayerID,
      userName,
      displayText,
      newRecipient,
      new Date(),
    ));
    setNewText('')
  }
  const checkSender = (profileId: string) => (profileId === myPlayerID ? classes.playerMessage : classes.otherPlayerMessage)
  const checkSenderName = (profileId: string) => (profileId === myPlayerID ? classes.playerMessageName : classes.otherPlayerMessageName)

  const handleRecipientSelect = (e: React.ChangeEvent<{ value: unknown }>) => {
    const {value} = e.target;
    if (value === 'town') {
      setNewRecipient('town');
    } else {
      setNewRecipient({recipientId: value as string});
    }
  }

  return (
    <Box border={1}>
      <Grid className={classes.chatbox}>
        <Typography
          variant='h4'
          className={classes.chatHeader}>{currentTownFriendlyName}&apos;s chat</Typography>
        <FormGroup
          row
          className={classes.formControl}
        >
          <InputLabel
            id="playerChatSelection">Select A Player</InputLabel>
          <Select
            labelId="playerChatSelection"
            defaultValue='town'
            onChange={e => handleRecipientSelect(e)}
          >
            {/* Will map players in room here */}
            {players.filter(p => p.id !== myPlayerID).map((player) =>
              <MenuItem key={player.id} value={player.id}>{player.userName}</MenuItem>
            )}
            <MenuItem key='town' value='town'>Town</MenuItem>
          </Select>
        </FormGroup>


        <Grid className={classes.messageWindow} direction="column" container>
          {/*  Actual messages would go here */}
          {/* map messages here- ternary? popular function- clsx- space delimiter */}
          {/* TODO: get name from sender profile */}
          {/* {console.log(messages)} */}
          {messages.map((message) =>
            // console.log(message);
            (<Grid
              key={message.messageId}
              className={checkSender(message.senderProfileId)}>
              <ListItem
                className={checkSenderName(message.senderProfileId)}>{message.recipient !== 'town' ? '(private) ' : ''}{message.senderName}</ListItem>
              <Typography className={classes.messageBorder}>
                {message.content}
              </Typography>
            </Grid>)
          )
          }


        </Grid>
        <Grid container className={classes.messageCreation}>

          <MentionsInput className={classes.textField}
                         value={newText}
                         onChange={(e) => setNewText(e.target.value)}
                         onFocus={onFocus}
                         onBlur={onBlur}

          >
            {/* <Tooltip title="User mentioned you"> */}
            <Mention
              // style={{color: '#1d2bff'}}
              trigger="@"
              data={users}
              markup="@{{__id__||__display__}}"
            />
            {/* </Tooltip> */}


          </MentionsInput>
          {/* <TextField
            className={classes.textField}
            // multiline
            variant="filled"
            value={newText}
            onChange={(e) => checkForMention(e)}
          /> */}
          <Fab
            className={classes.fabIcon}
            onClick={() => sendMessage(newText)}><SendIcon color="secondary"/></Fab>
        </Grid>
      </Grid>
    </Box>
  )

}

export default ChatBox;
