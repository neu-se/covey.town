import { model, Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  senderName: string;
  senderID: string;
  receiverName: string;
  receiverID: string;
  roomName: string;
  roomID:string;
  content:string;
  time:string;
}

const MessageSchema: Schema = new Schema({
  senderName: { type: String, required: true },
  senderID: { type: String, required: true },
  receiverName: { type: String, required: true },
  receiverID: { type: String, required: true },
  roomName: { type: String, required: true },
  roomID: { type: String, required: true },
  content: { type: String, required: true },
  time: { type: String, required: true },
});

export default model<IMessage>('Message', MessageSchema);
