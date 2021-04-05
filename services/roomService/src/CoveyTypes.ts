export type Direction = 'front' | 'back' | 'left' | 'right';
export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
};
export type CoveyTownList = { friendlyName: string; coveyTownID: string; currentOccupancy: number; maximumOccupancy: number }[];

// Andrew - contains url, timestamp, and isPlaying which is passed around so that clients can sync up
export type YoutubeVideoInfo = {
  url: string;
  timestamp: number;
  isPlaying: boolean;
}

export type videoActionTimeStamp = {
  actionType: string;
  actionDate: Date;
}