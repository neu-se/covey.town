export type Direction = 'front' | 'back' | 'left' | 'right';
export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
};
export type CoveyTownList = { friendlyName: string; coveyTownID: string; currentOccupancy: number; maximumOccupancy: number }[];

export type Message = {
  body: string,
  senderId: string,
  ownedByCurrentUser: boolean,
  userName: string,
  dateCreated: Date,
  receiverId: string, 
  isBroadcast: boolean, 
};
