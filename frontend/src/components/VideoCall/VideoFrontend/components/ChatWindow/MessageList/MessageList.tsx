import React from 'react';
import { ChatMessage } from '../../../../../../classes/TextConversation';
import MessageInfo from './MessageInfo/MessageInfo';
import MessageListScrollContainer from './MessageListScrollContainer/MessageListScrollContainer';
import TextMessage from './TextMessage/TextMessage';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import usePlayersInTown from '../../../../../../hooks/usePlayersInTown';
import useCoveyAppState from '../../../../../../hooks/useCoveyAppState';

interface MessageListProps {
  messages: ChatMessage[];
}

const getFormattedTime = (message?: ChatMessage) =>
  message?.dateCreated.toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric' }).toLowerCase();

export default function MessageList({ messages }: MessageListProps) {
  const { room } = useVideoContext();
  const localParticipant = room!.localParticipant;

  return (
    <MessageListScrollContainer messages={messages}>
      {messages.map((message, idx) => {
        const time = getFormattedTime(message)!;
        const previousTime = getFormattedTime(messages[idx - 1]);

        // Display the MessageInfo component when the author or formatted timestamp differs from the previous message
        // and when type or receivers are changed
        const shouldDisplayMessageInfo = time !== previousTime
          || message.authorId !== messages[idx - 1]?.authorId
          || message.type !== messages[idx - 1]?.type
          || message.receiverId !== messages[idx - 1]?.receiverId;

        const isLocalParticipant = localParticipant.identity === message.authorId;

        return (
          <React.Fragment key={message.sid}>
            {shouldDisplayMessageInfo && (
              <MessageInfo isLocalParticipant={isLocalParticipant} message={message} dateCreated={time} />
            )}
            <TextMessage body={message.body} isLocalParticipant={isLocalParticipant} messageType={message.type} />
          </React.Fragment>
        );
      })}
    </MessageListScrollContainer>
  );
}
