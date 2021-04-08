import React, {useState} from "react";
import {Fab, Hidden} from "@material-ui/core";
import ForumIcon from '@material-ui/icons/Forum';
import {makeStyles} from "@material-ui/styles";
import ChatBox from "./chat-box";


const useStyles = makeStyles({
  root: {},
  chatToggle: {
    position: 'fixed',
    bottom: '2%',
    right: '2%',
  }
});

const ChatView = (): JSX.Element => {

  const classes = useStyles();
  const [view, setView] = useState<boolean>(false)

  return (
    <>
      <Hidden only={['xs', 'sm', 'md']}>
        <ChatBox/>
      </Hidden>
      <Hidden only={['lg', 'xl']}>
        {
          view ? <ChatBox/> : null
        }
        <Fab>
          <ForumIcon
            className={classes.chatToggle}
            onClick={() => setView(!view)}/>
          </Fab>
      </Hidden>

      </>
  )

}

export default ChatView;
