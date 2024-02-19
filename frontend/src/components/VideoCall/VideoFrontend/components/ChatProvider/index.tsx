import React, { createContext, ReactNode, useEffect, useRef, useState } from 'react';
import TextConversation from '../../../../../classes/TextConversation';
import useTownController from '../../../../../hooks/useTownController';
import { ChatMessage } from '../../../../../types/CoveyTownSocket';

type ChatContextType = {
  isChatWindowOpen: boolean;
  setIsChatWindowOpen: (isChatWindowOpen: boolean) => void;
  hasUnreadMessages: boolean;
  messages: ChatMessage[];
  conversation: TextConversation | null;
  isChatWindowClosable: boolean;
};

export const ChatContext = createContext<ChatContextType>(null!);

export const ChatProvider = ({ children, interactableID} : {children?: ReactNode | undefined, interactableID?: string}) => {
  const coveyTownController = useTownController();
  const isChatWindowOpenRef = useRef(false);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const [isChatWindowClosable, setIsChatWindowClosable] = useState(interactableID === undefined);
  const [conversation, setConversation] = useState<TextConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    if (conversation) {
      const handleMessageAdded = (message: ChatMessage) =>
        setMessages(oldMessages => [...oldMessages, message]);
      conversation.getMessages().then(newMessages => setMessages(newMessages));
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
    const conv = new TextConversation(coveyTownController, interactableID);
    setConversation(conv);
    setIsChatWindowClosable(interactableID === undefined);
    return () => {
      conv.close();
    };
  }, [coveyTownController, interactableID]);

  return (
    <ChatContext.Provider
      value={{
        isChatWindowOpen,
        setIsChatWindowOpen,
        hasUnreadMessages,
        messages,
        conversation,
        isChatWindowClosable
      }}>
      {children}
    </ChatContext.Provider>
  );
};
