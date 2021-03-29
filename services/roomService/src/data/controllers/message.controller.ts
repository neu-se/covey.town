import {CreateQuery} from 'mongoose';
import Message, {IMessage} from '../models/message.server';
import {ResponseEnvelope} from '../../requestHandlers/CoveyTownRequestHandlers';

async function createMessage({
  senderName,
  senderID,
  receiverName,
  receiverID,
  roomName,
  roomID,
  content,
  time,
}: CreateQuery<IMessage>): Promise<ResponseEnvelope<Record<string, null>>> {
  Message.create({
    senderName,
    senderID,
    receiverName,
    receiverID,
    roomName,
    roomID,
    content,
    time,
  })
    .then((data: IMessage) => data)
    .catch((error: Error) => {
      throw error;
    });
  return {
    isOK: true,
    response: {},
  };
}

async function getMessagesForRoom(roomIDToFind: string): Promise<ResponseEnvelope<TownChatHistoryResponse>> {
  const res = await Message.find({roomID: roomIDToFind})
    .then((data: IMessage[]) => data)
    .catch((error: Error) => {
      throw error;
    });
  return {
    isOK: true,
    response: {chats: res},
  };
}

export interface TownChatHistoryResponse {
  chats: IMessage[];
}

export default {
  createMessage,
  getMessagesForRoom,
};
