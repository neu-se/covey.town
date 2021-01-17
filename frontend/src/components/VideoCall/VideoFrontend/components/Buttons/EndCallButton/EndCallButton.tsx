import React from 'react';
import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { Button } from '@material-ui/core';

import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../../state';

const useStyles = makeStyles((theme: Theme) => createStyles({
  button: {
    background: theme.brand,
    color: 'white',
    '&:hover': {
      background: '#600101',
    },
  },
}));

export default function EndCallButton(props: { className?: string }) {
  const classes = useStyles();
  const { room } = useVideoContext();

  // const {handleDisconnect} = useAppState();

  return (
    <Button
      onClick={async () => {
        await room.disconnect();
      }}
      className={clsx(classes.button, props.className)}
      data-cy-disconnect
    >
      Disconnect
    </Button>
  );
}
