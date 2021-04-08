export default class PlayerMessage {
  set content(value: string) {
    this._content = value;
  }

  get content(): string {
    return this._content;
  }

  get recipient(): "town" | { recipientId: string } {
    return this._recipient;
  }

  get senderProfileId(): string {
    return this._senderProfileId;
  }

  get date(): Date {
    return this._date;
  }

  get senderName(): string {
    return this._senderName;
  }

  get messageId(): string {
    return this._messageId;
  }

  private _content: string;

  private readonly _senderProfileId: string;

  private readonly _senderName: string;

  private readonly _recipient: "town" | { recipientId: string };

  private readonly _date: Date;

  private readonly _messageId: string;


  constructor(
    messageId: string,
    senderProfileId: string,
    senderName: string,
    content: string,
    recipient: "town" | { recipientId: string },
    date: Date,
  ) {
    this._messageId = messageId;
    this._senderProfileId = senderProfileId;
    this._senderName = senderName;
    this._content = content;
    this._recipient = recipient;
    this._date = date;
  }


  static fromServerMessage(messageFromServer: ServerMessage): PlayerMessage {
    return new PlayerMessage(
      messageFromServer._messageId,
      messageFromServer._senderProfileId,
      messageFromServer._senderName,
      messageFromServer._content,
      messageFromServer._recipient,
      messageFromServer._date,
    );
  }
}

export type ServerMessage = {
  _messageId: string,
  _senderProfileId: string,
  _senderName: string,
  _content: string,
  _recipient: "town" | { recipientId: string },
  _date: Date,
}
