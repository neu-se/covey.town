import assert from 'assert';
import { useContext } from 'react';
import Player from '../classes/Player';
import NearbyPlayersContext from '../contexts/NearbyPlayersContext';

export default function useNearbyPlayers(): Player[] {
  const ctx = useContext(NearbyPlayersContext);
  assert(ctx, 'App context should be defined.');
  return ctx;
}
