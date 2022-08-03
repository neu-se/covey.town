import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import CloseIcon from '../../../icons/CloseIcon';

import useChatContext from '../../../hooks/useChatContext/useChatContext';
import { Button, Stack } from '@chakra-ui/react';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      height: '56px',
      background: '#F4F4F6',
      borderBottom: '1px solid #E4E7E9',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 1em',
    },
    text: {
      fontWeight: 'bold',
    },
    closeChatWindow: {
      cursor: 'pointer',
      display: 'flex',
      background: 'transparent',
      border: '0',
      padding: '0.4em',
    }
  })
);

export default function ChatWindowHeader() {
  const classes = useStyles();
  const { setIsChatWindowOpen, global, setGlobal, group, setGroup, direct, setDirect } = useChatContext();

  return (
    <>
      <div className={classes.container}>
        <div className={classes.text}>Chat</div>
        <button className={classes.closeChatWindow} onClick={() => setIsChatWindowOpen(false)}>
          <CloseIcon />
        </button>
      </div>
      <Stack direction='row' spacing={4} align='center'>
        <Button colorScheme='teal' variant={global ? 'solid' : 'outline'} onClick={() => setGlobal(!global)}>
          Global
        </Button>
        <Button colorScheme='teal' variant={group ? 'solid' : 'outline'} onClick={() => setGroup(!group)}>
          Group
        </Button>
        <Button colorScheme='teal' variant={direct ? 'solid' : 'outline'} onClick={() => setDirect(!direct)}>
          Direct
        </Button>
      </Stack>
    </>

  );
}
