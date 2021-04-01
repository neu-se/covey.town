import React, {useState, useEffect} from "react";

import _escapeRegExp from 'lodash/escapeRegExp'
import _uniqBy from 'lodash/uniqBy'

import {
  Box,
  Fab,
  FormGroup,
  Grid,
  InputLabel,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import {MentionsInput, Mention} from 'react-mentions'

import '../../App.css';
import {makeStyles} from "@material-ui/styles";
import SendIcon from '@material-ui/icons/Send';
import useCoveyAppState from "../../hooks/useCoveyAppState";
import PlayerMessage from "../../classes/PlayerMessage";
import PlayerMention from "../../classes/PlayerMention";
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
  const classes = useStyles();
  const [users, setUsers] = useState<MentionUser []>([]);
  const video = useMaybeVideo();
  const onFocus = () => video?.pauseGame();
  const onBlur = () => video?.unPauseGame();

  useEffect(() => {
    setUsers(players.map(player => new MentionUser(player.id, player.userName)));
  }, [players])


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

    emitMessage(new PlayerMessage(
      '',
      myPlayerID,
      userName,
      text,
      'town',
      new Date(),
    ));
    setNewText('')
  }
  const checkSender = (profileId: string) => (profileId === myPlayerID ? classes.playerMessage : classes.otherPlayerMessage)
  const checkSenderName = (profileId: string) => (profileId === myPlayerID ? classes.playerMessageName : classes.otherPlayerMessageName)

  return (
    <Box border={1}>
      <Grid className={classes.chatbox}>
        <Typography
          variant='h4'
          className={classes.chatHeader}>{currentTownFriendlyName}&apos;s chat</Typography>
        {/* <FormGroup */}
        {/*  row */}
        {/*  className={classes.formControl} */}
        {/*  > */}
        {/*  <InputLabel */}
        {/*    id="playerChatSelection">Select A Player</InputLabel> */}
        {/*  <Select */}
        {/*    labelId="playerChatSelection"> */}
        {/*    /!* Will map players in room here *!/ */}
        {/*    {players.map((player) => */}
        {/*      <MenuItem key={player.id} value={player.id}>{player.userName}</MenuItem> */}
        {/*    )} */}
        {/*  </Select> */}
        {/* </FormGroup> */}


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
                className={checkSenderName(message.senderProfileId)}>{message.senderName}</ListItem>
              <Typography
                className={classes.messageBorder}>{message.content}</Typography>
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
            <Mention

              trigger="@"
              data={users}
              markup="@{{__id__||__display__}}"
            />


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
