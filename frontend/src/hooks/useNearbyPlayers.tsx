import assert from 'assert';
import { useContext } from 'react';
import { NearbyPlayers } from '../CoveyTypes';
import NearbyPlayersContext from '../contexts/NearbyPlayersContext';

export default function useNearbyPlayers(): NearbyPlayers {
  const ctx = useContext(NearbyPlayersContext);
  assert(ctx, 'App context should be defined.');
  return ctx;
}
