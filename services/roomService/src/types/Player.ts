import { nanoid } from 'nanoid';
import { Message, MessageType, UserLocation } from '../CoveyTypes';
import MessageChain from './MessageChain';

/**
 * Each user who is connected to a town is represented by a Player object
 */
export default class Player {
  /** The current location of this user in the world map * */
  public location: UserLocation;

  /** The unique identifier for this player * */
  private readonly _id: string;

  /** The player's username, which is not guaranteed to be unique within the town * */
  private readonly _userName: string;

  private _townMessageChain: MessageChain;

  constructor(userName: string) {
    this.location = {
      x: 0,
      y: 0,
      moving: false,
      rotation: 'front',
    };
    this._userName = userName;
    this._id = nanoid();
    this._townMessageChain = new MessageChain();
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  get townMessageChain(): MessageChain {
    return this._townMessageChain;
  }

  receiveMessage(message: Message): void {
    switch (message.type) {
      case  MessageType.TownMessage:
        this._townMessageChain.addMessage(message);
        break;
      default:
        break;
    }
  }

  updateLocation(location: UserLocation): void {
    this.location = location;
  }
}
