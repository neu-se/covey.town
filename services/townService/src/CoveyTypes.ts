export type Direction = 'front' | 'back' | 'left' | 'right';
export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
  conversationLabel?: string;
};
export type CoveyTownList = { friendlyName: string; coveyTownID: string; currentOccupancy: number; maximumOccupancy: number }[];
export type UserProfile = {
  displayName:string;
  id:string;
};
export type ChatMessage = {
  author: UserProfile;
  sid: string;
  body: string;
  dateCreated: Date;
  receiver?:UserProfile
};
export type PlayerStatus = 'free' | 'busy';
