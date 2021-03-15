import React, { useState } from 'react';
import ChatContainer from './ChatContainer';
import ChatSelectContainer from './ChatSelectContainer';
import './ChatSidebar.css';

export default function ChatSidebar(): JSX.Element {
  const [isViewingChatContainer] = useState(false);
  const content = isViewingChatContainer ? <ChatContainer /> : <ChatSelectContainer />;
  return (
    <div className='chat-sidebar'>
      <div className='sidebar-header'>Chat</div>
      {content}
    </div>
  );
}
