import React, { createContext, useEffect, useRef, useState } from 'react';
import TextConversation from '../../../../../classes/TextConversation';
import useTownController from '../../../../../hooks/useTownController';
import { ChatMessage } from '../../../../../types/CoveyTownSocket';

type ChatContextType = {
  isChatWindowOpen: boolean;
  setIsChatWindowOpen: (isChatWindowOpen: boolean) => void;
  hasUnreadMessages: boolean;
  messages: ChatMessage[];
  conversation: TextConversation | null;
};

export const ChatContext = createContext<ChatContextType>(null!);

export const ChatProvider: React.FC = ({ children }) => {
  const coveyTownController = useTownController();
  const isChatWindowOpenRef = useRef(false);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const [conversation, setConversation] = useState<TextConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    if (conversation) {
      const handleMessageAdded = (message: ChatMessage) =>
        setMessages(oldMessages => [...oldMessages, message]);
      //TODO - store entire message queue on server?
      // conversation.getMessages().then(newMessages => setMessages(newMessages.items));
      conversation.onMessageAdded(handleMessageAdded);
      return () => {
        conversation.offMessageAdded(handleMessageAdded);
      };
    }
  }, [conversation]);

  useEffect(() => {
    // If the chat window is closed and there are new messages, set hasUnreadMessages to true
    if (!isChatWindowOpenRef.current && messages.length) {
      setHasUnreadMessages(true);
    }
  }, [messages]);

  useEffect(() => {
    isChatWindowOpenRef.current = isChatWindowOpen;
    if (isChatWindowOpen) setHasUnreadMessages(false);
  }, [isChatWindowOpen]);

  useEffect(() => {
    const conv = new TextConversation(coveyTownController);
    setConversation(conv);
    return () => {
      conv.close();
    };
  }, [coveyTownController, setConversation]);

  return (
    <ChatContext.Provider
      value={{
        isChatWindowOpen,
        setIsChatWindowOpen,
        hasUnreadMessages,
        messages,
        conversation,
      }}>
      {children}
    </ChatContext.Provider>
  );
};
