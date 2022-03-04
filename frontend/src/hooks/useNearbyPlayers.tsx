import assert from 'assert';
import { useContext } from 'react';
import Player from '../classes/Player';
import NearbyPlayersContext from '../contexts/NearbyPlayersContext';

/**
 * Returns the list of nearby players, as defined by the app's "nearby" semantics, which might
 * include conversation area boundaries in its logic.
 * 
 * Components that use this hook will be re-rendered whenever the list of nearby players changes,
 * but NOT when players move (but stay "nearby")
 */
export default function useNearbyPlayers(): Player[] {
  const ctx = useContext(NearbyPlayersContext);
  assert(ctx, 'App context should be defined.');
  return ctx;
}
