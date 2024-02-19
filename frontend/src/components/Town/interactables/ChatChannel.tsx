import React from 'react';
import { ChatProvider } from '../../VideoCall/VideoFrontend/components/ChatProvider';
import ChatWindow from '../../VideoCall/VideoFrontend/components/ChatWindow/ChatWindow';

export default function ChatChannel({ interactableID }: { interactableID: string }): JSX.Element {
  return (
    <ChatProvider interactableID={interactableID}>
      <ChatWindow />
    </ChatProvider>
  );
}
