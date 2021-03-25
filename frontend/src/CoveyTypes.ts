import { Socket } from 'socket.io-client';
import Player, { UserLocation } from './classes/Player';
import TownsServiceClient from './classes/TownsServiceClient';

export type CoveyEvent = 'playerMoved' | 'playerAdded' | 'playerRemoved';

export type VideoRoom = {
  twilioID: string,
  id: string
};
export type UserProfile = {
  id: string,
  displayName: string
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
};
export type EmailPasswordCredential = {
  email: string,
  password: string
}

export type AuthState = {
  isLoggedIn: boolean,
  currentUser: CoveyUser | null,
}

export type AuthInfo = {
  isLoggedIn: boolean,
  currentUser: CoveyUser | null,
  actions: AuthActions
}

export type AuthActions = {
  handleLogout: () => void,
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
}

export type CoveyUserProfile = {
  user_id: string,
  userName: string,
  email:string,
  pfpURL?: string,
  bio?: string,
}


export type CoveyUser = {
  id: string,
  isLoggedIn: boolean
  profile: CoveyUserProfile,
  actions: CoveyUserActions,
}

export type CoveyUserActions = {
  logout: () => Promise<void>
}