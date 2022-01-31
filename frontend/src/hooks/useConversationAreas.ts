import assert from 'assert';
import { useContext } from 'react';
import ConversationArea from '../classes/ConversationArea';
import ConversationAreasContext from '../contexts/ConversationAreasContext';

export default function useConversationAreas(): ConversationArea[] {
  const ctx = useContext(ConversationAreasContext);
  assert(ctx, 'Conversation area context should be defined.');
  return ctx;
}
