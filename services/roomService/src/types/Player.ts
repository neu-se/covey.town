import { nanoid } from 'nanoid';
import { ServerConversationArea } from '../client/TownsServiceClient';
import { UserLocation } from '../CoveyTypes';

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

  private _activeConversation?: ServerConversationArea;

  constructor(userName: string) {
    this.location = {
      x: 0,
      y: 0,
      moving: false,
      rotation: 'front',
    };
    this._userName = userName;
    this._id = nanoid();
  }

  get activeConversation(): ServerConversationArea | undefined {
    return this._activeConversation;
  }

  set activeConversation(conversation: ServerConversationArea | undefined) {
    this._activeConversation = conversation;
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  updateLocation(location: UserLocation): void {
    this.location = location;
  }

  isWithin(conversation: ServerConversationArea) {
    return (
      this.location.x >= conversation.boundingBox.x - conversation.boundingBox.width / 2 &&
      this.location.x <= conversation.boundingBox.x + conversation.boundingBox.width / 2 &&
      this.location.y >= conversation.boundingBox.y - conversation.boundingBox.height / 2 &&
      this.location.y <= conversation.boundingBox.y + conversation.boundingBox.height / 2
    );
  }
}
