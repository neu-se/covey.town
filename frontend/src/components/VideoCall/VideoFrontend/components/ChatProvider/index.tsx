import React, { createContext, useEffect, useRef, useState } from 'react';
import TextConversation, { ChatMessage, MessageType } from '../../../../../classes/TextConversation';
import useCoveyAppState from '../../../../../hooks/useCoveyAppState';

type ChatContextType = {
  isChatWindowOpen: boolean;
  setIsChatWindowOpen: (isChatWindowOpen: boolean) => void;
  hasUnreadMessages: boolean;
  messages: ChatMessage[];
  conversation: TextConversation | null;
  global: boolean;
  setGlobal: (global: boolean) => void;
  group: boolean;
  setGroup: (group: boolean) => void;
  direct: boolean;
  setDirect: (direct: boolean) => void;
};

export const ChatContext = createContext<ChatContextType>(null!);

export const ChatProvider: React.FC = ({ children }) => {
  const { socket, userName } = useCoveyAppState();
  const isChatWindowOpenRef = useRef(false);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const [conversation, setConversation] = useState<TextConversation | null>(null);
  const [totalMessages, setTotalMessages] = useState<ChatMessage[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [global, setGlobal] = useState(true)
  const [group, setGroup] = useState(true)
  const [direct, setDirect] = useState(true)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    if (conversation) {
      const handleMessageAdded = (message: ChatMessage) =>
        setTotalMessages(oldMessages => [...oldMessages, message]);
      //TODO - store entire message queue on server?
      // conversation.getMessages().then(newMessages => setMessages(newMessages.items));
      conversation.onMessageAdded(handleMessageAdded);
      return () => {
        conversation.offMessageAdded(handleMessageAdded);
      };
    }
  }, [conversation]);

  // update showing messages when messages or options are updated
  useEffect(() => {
    console.log(totalMessages)
    console.log(messages)
    setMessages(totalMessages.filter(message =>
      (message.type === MessageType.GLOBAL_MESSAGE && global) ||
      (message.type === MessageType.GROUP_MESSAGE && group) ||
      (message.type === MessageType.DIRECT_MESSAGE && direct)
    ))
  }, [global, group, direct, totalMessages])

  useEffect(() => {
    // If the chat window is closed and there are new messages, set hasUnreadMessages to true
    if (!isChatWindowOpenRef.current && totalMessages.length) {
      setHasUnreadMessages(true);
    }
  }, [totalMessages]);

  useEffect(() => {
    isChatWindowOpenRef.current = isChatWindowOpen;
    if (isChatWindowOpen) setHasUnreadMessages(false);
  }, [isChatWindowOpen]);

  useEffect(() => {
    if (socket) {
      const conv = new TextConversation(socket, userName);
      setConversation(conv);
      return () => {
        conv.close();
      };
    }
  }, [socket, userName, setConversation]);

  return (
    <ChatContext.Provider
      value={{
        isChatWindowOpen,
        setIsChatWindowOpen,
        hasUnreadMessages,
        messages,
        conversation,
        global,
        setGlobal,
        group,
        setGroup,
        direct,
        setDirect
      }}>
      {children}
    </ChatContext.Provider>
  );
};
