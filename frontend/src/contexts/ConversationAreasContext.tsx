import React from 'react';
import ConversationArea from '../classes/ConversationArea';

/**
 * Hint: You will never need to use this directly. Instead, use the
 * `useConversationAreas` hook.
 */
const Context = React.createContext<ConversationArea[]>([]);

export default Context;
