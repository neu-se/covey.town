import Player from "./types/Player";

export type Direction = 'front' | 'back' | 'left' | 'right';
export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
};
export type CoveyTownList = { friendlyName: string; coveyTownID: string; currentOccupancy: number; maximumOccupancy: number }[];

export enum MessageType {
  DirectMessage,
  ProximityMessage,
  TownMessage
};

export type Message = {
  // user who sent the message
  user: Player;
  messageContent: string;
  timestamp: string;
  type: MessageType;
  // null for cases of Proximity and Town Message
  directMessageId: string | null;
}