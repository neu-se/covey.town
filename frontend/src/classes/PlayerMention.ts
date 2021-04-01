import {nanoid} from "nanoid";
import {ServerPlayer} from "./Player";

export default class PlayerMention {
  

  get recipient(): string  {
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

  

  
  private readonly _senderProfileId: string;

  private readonly _senderName: string;

  private readonly _recipient: string;

  private readonly _date: Date;




  constructor(    
    senderProfileId: string,
    senderName: string,    
    recipient: string,
    date: Date,
  ) {
    
    this._senderProfileId = senderProfileId;
    this._senderName = senderName;
    this._recipient = recipient;
    this._date = date;
  }


  static fromServerMentionMessage(messageFromServer: ServerMentionMessage): PlayerMention {
    return new  PlayerMention(      
      messageFromServer._senderProfileId,
      messageFromServer._senderName,
      messageFromServer._recipient,
      messageFromServer._date,
    );
  }
}

export type ServerMentionMessage = { 
  _senderProfileId: string,
  _senderName: string, 
  _recipient: string,
  _date: Date,
}
