import {nanoid} from 'nanoid';

export default class PlayerMessage {
  set content(value: string) {
    if (value === '') {
      throw Error('Content cannot be empty');
    }
    this._content = value;
  }

  get content(): string {
    return this._content;
  }

  get recipient(): 'town' | { recipientId: string } {
    return this._recipient;
  }

  get senderProfileId(): string {
    return this._senderProfileId;
  }

  private _content: string;

  private readonly _senderProfileId: string;

  private readonly _senderName: string;

  private readonly _recipient: 'town' | { recipientId: string };

  private _date: Date;

  private readonly _messageId: string;


  constructor(
    senderProfileId: string,
    senderName: string,
    content: string,
    recipient: 'town' | { recipientId: string },
  ) {
    if (senderProfileId === '') {
      throw Error('Sender profile id cannot be empty');
    }
    if (senderName === '') {
      throw Error('Sender name cannot be empty');
    }
    if (content === '') {
      throw Error('Content cannot be empty');
    }
    if (typeof recipient === 'object' && recipient.recipientId === '') {
      throw Error('Recipient id cannot be empty');
    }
    this._messageId = nanoid();
    this._senderProfileId = senderProfileId;
    this._senderName = senderName;
    this._content = content;
    this._recipient = recipient;
    this._date = new Date(new Date().getUTCDate());
  }

  static fromClientPlayerMessage(playerMessageFromClient: ClientPlayerMessage): PlayerMessage {
    return new PlayerMessage(
      playerMessageFromClient._senderProfileId,
      playerMessageFromClient._senderName,
      playerMessageFromClient._content,
      playerMessageFromClient._recipient);
  }

}
export type ClientPlayerMessage = {
  _messageId: string,
  _senderProfileId: string,
  _senderName: string,
  _content: string,
  _recipient: 'town' | { recipientId: string },
  _date: Date,
};
