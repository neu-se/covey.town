import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { ChatMessage, MessageType } from '../../../../../../../classes/TextConversation';
import usePlayersInTown from '../../../../../../../hooks/usePlayersInTown';

const useStyles = makeStyles(() =>
  createStyles({
    messageInfoContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.425em 0 0.083em',
      fontSize: '12px',
      color: '#606B85',
    },
  })
);

interface MessageInfoProps {
  dateCreated: string;
  isLocalParticipant: boolean;
  message: ChatMessage;
}

export default function MessageInfo({ dateCreated, isLocalParticipant, message }: MessageInfoProps) {
  const classes = useStyles();
  const players = usePlayersInTown();

  return (
    <div className={classes.messageInfoContainer}>
      <div>{isLocalParticipant ? (
        message.type === MessageType.GLOBAL_MESSAGE ? 'To Global'
          : message.type === MessageType.GROUP_MESSAGE ? 'To Group'
            : 'To ' + message.receiverName
      ) : message.authorName}</div>
      <div>{dateCreated}</div>
    </div>
  );
}
