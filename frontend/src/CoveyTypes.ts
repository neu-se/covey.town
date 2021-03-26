import { Socket } from 'socket.io-client';
import { YouTubePlayer } from 'youtube-player/dist/types'; // TODO
import Player, { UserLocation } from './classes/Player';
import TownsServiceClient from './classes/TownsServiceClient';

export type CoveyEvent = 'playerMoved' | 'playerAdded' | 'playerRemoved';

export type VideoRoom = {
  twilioID: string,
  id: string
};
export type UserProfile = {
  displayName: string,
  id: string
};
export type NearbyPlayers = {
  nearbyPlayers: Player[]
};
export type CoveyAppState = {
  sessionToken: string,
  userName: string,
  currentTownFriendlyName: string,
  currentTownID: string,
  currentTownIsPubliclyListed: boolean,
  myPlayerID: string,
  players: Player[],
  currentLocation: UserLocation,
  nearbyPlayers: NearbyPlayers,
  emitMovement: (location: UserLocation) => void,
  socket: Socket | null,
  apiClient: TownsServiceClient,
  videoPlaying: boolean, // Andrew TODO
  youtubeplayer: YouTubePlayer | null, // Andrew TODO
  showYTPlayer: boolean, // Andrew TODO
  mostRecentVideoSync: YoutubeVideoInfo | null, // Andrew TODO
  youtubeplayers: YouTubePlayer[],
  syncInterval: NodeJS.Timeout | null,
  // beforeTime: number, // Andrew TODO
};
export type YoutubeVideoInfo = {
  url: string;
  timestamp: number;
  isPlaying: boolean;
}