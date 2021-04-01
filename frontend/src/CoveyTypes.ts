import {Socket} from 'socket.io-client';
import Player, {UserLocation} from './classes/Player';
import TownsServiceClient from './classes/TownsServiceClient';
import PlayerMessage from "./classes/PlayerMessage";

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
  messages: PlayerMessage[],
  myPlayerID: string,
  players: Player[],
  currentLocation: UserLocation,
  nearbyPlayers: NearbyPlayers,
  emitMovement: (location: UserLocation) => void,
  emitMessage: (message: PlayerMessage) => void,
  socket: Socket | null,
  apiClient: TownsServiceClient,
};
