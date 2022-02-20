import { nanoid } from 'nanoid';
import { Socket } from 'socket.io-client';

/**
 * A basic representation of a text conversation, bridged over a socket.io client
 * The interface to this class was designed to closely resemble the Twilio Conversations API,
 * to make it easier to use as a drop-in replacement.
 */
export default class TextConversation {
  private _socket: Socket;

  private _callbacks: MessageCallback[] = [];

  private _authorName: string;

  /**
   * Create a new Text Conversation
   *
   * @param socket socket to use to send/receive messages
   * @param authorName name of message author to use as sender
   */
  public constructor(socket: Socket, authorName: string) {
    this._socket = socket;
    this._authorName = authorName;
    this._socket.on('chatMessage', (message: ChatMessage) => {
      message.dateCreated = new Date(message.dateCreated);
      this.onChatMessage(message);
    });
  }

  private onChatMessage(message: ChatMessage) {
    this._callbacks.forEach(cb => cb(message));
  }

  /**
   * Send a text message to this channel
   * @param message
   */
  public sendMessage(message: string) {
    const msg: ChatMessage = {
      sid: nanoid(),
      body: message,
      author: this._authorName,
      dateCreated: new Date(),
    };
    this._socket.emit('chatMessage', msg);
  }

  /**
   * Register an event listener for processing new chat messages
   * @param event
   * @param cb
   */
  public onMessageAdded(cb: MessageCallback) {
    this._callbacks.push(cb);
  }

  /**
   * Removes an event listener for processing new chat messages
   * @param cb
   */
  public offMessageAdded(cb: MessageCallback) {
    this._callbacks = this._callbacks.filter(_cb => _cb !== cb);
  }

  /**
   * Release the resources used by this conversation
   */
  public close(): void {
    this._socket.off('chatMessage');
  }
}
type MessageCallback = (message: ChatMessage) => void;
export type ChatMessage = {
  author: string;
  sid: string;
  body: string;
  dateCreated: Date;
};
