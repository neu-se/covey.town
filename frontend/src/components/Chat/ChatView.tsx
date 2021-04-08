import React from "react";
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



  const showModal = () => {

  }

  return (
    <>
      <Hidden only={['xs', 'sm', 'md']}>
        <ChatBox/>
      </Hidden>
      <Hidden only={['lg', 'xl']}>
        <Fab>
          <ForumIcon
            className={classes.chatToggle}
            onClick={() => showModal()}/>
          </Fab>
      </Hidden>

      </>
  )

}

export default ChatView;
