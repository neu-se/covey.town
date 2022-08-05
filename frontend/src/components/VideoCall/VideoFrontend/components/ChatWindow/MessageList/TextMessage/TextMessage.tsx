import React from 'react';
import clsx from 'clsx';
import { Link } from '@material-ui/core';
import linkify from 'linkify-it';
import { makeStyles } from '@material-ui/core/styles';
import { MessageType } from '../../../../../../../classes/TextConversation';

const useStyles = makeStyles({
  messageContainer: {
    borderRadius: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.5em 0.8em 0.6em',
    margin: '0.3em 0 0',
    wordBreak: 'break-word',
    backgroundColor: '#E1E3EA',
    hyphens: 'auto',
    whiteSpace: 'pre-wrap',
  },
  globalMessage: { backgroundColor: '#c5ddb2', },
  toGlobalMessage: { backgroundColor: '#a1c984', },
  groupMessage: { backgroundColor: '#a8d5e5', },
  toGroupMessage: { backgroundColor: '#66b6d2', },
  directMessage: { backgroundColor: '#ffeebf', },
  toDirectMessage: { backgroundColor: '#ffe08c', },
  // isLocalParticipant: {
  //   backgroundColor: '#CCE4FF',
  // },
  isAuthor: {
    justifyContent: 'right',
    display: 'flex'
  }
});

interface TextMessageProps {
  body: string;
  isLocalParticipant: boolean;
  messageType: MessageType;
}

function addLinks(text: string) {
  const matches = linkify().match(text);
  if (!matches) return text;

  const results = [];
  let lastIndex = 0;

  matches.forEach((match, i) => {
    results.push(text.slice(lastIndex, match.index));
    results.push(
      <Link target="_blank" rel="noreferrer" href={match.url} key={i}>
        {match.text}
      </Link>
    );
    lastIndex = match.lastIndex;
  });

  results.push(text.slice(lastIndex, text.length));

  return results;
}

export default function TextMessage({ body, isLocalParticipant, messageType }: TextMessageProps) {
  const classes = useStyles();

  return (
    <div className={clsx({ [classes.isAuthor]: isLocalParticipant })}>
      <div
        className={clsx(classes.messageContainer, {
          // [classes.isLocalParticipant]: isLocalParticipant,
          [classes.globalMessage]: messageType === MessageType.GLOBAL_MESSAGE && !isLocalParticipant,
          [classes.toGlobalMessage]: messageType === MessageType.GLOBAL_MESSAGE && isLocalParticipant,
          [classes.groupMessage]: messageType === MessageType.GROUP_MESSAGE && !isLocalParticipant,
          [classes.toGroupMessage]: messageType === MessageType.GROUP_MESSAGE && isLocalParticipant,
          [classes.directMessage]: messageType === MessageType.DIRECT_MESSAGE && !isLocalParticipant,
          [classes.toDirectMessage]: messageType === MessageType.DIRECT_MESSAGE && isLocalParticipant,
        })}
      >
        <div>{addLinks(body)}</div>
      </div>
    </div>
  );
}
