

export default class PlayerMention {
  

  get recipient(): string  {
    return this._recipient;
  }

  get senderProfileId(): string {
    return this._senderProfileId;
  }
  

  private readonly _senderProfileId: string;

  private readonly _senderName: string;

  private readonly _recipient: string ;

  private _date: Date;



  constructor(
    senderProfileId: string,
    senderName: string,
    recipient: string,
  ) {

    
    this._senderProfileId = senderProfileId;
    this._senderName = senderName;
    this._recipient = recipient;
    this._date = new Date(new Date().getUTCDate());
  }

  static fromClientPlayerMention(playerMessageFromClient: ClientPlayerMention): PlayerMention {
    return new PlayerMention(
      playerMessageFromClient._senderProfileId,
      playerMessageFromClient._senderName,
      playerMessageFromClient._recipient);
  }

}
export type ClientPlayerMention = {

  _senderProfileId: string,
  _senderName: string,
  _recipient: string,
  _date: Date,
};
