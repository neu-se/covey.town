import assert from 'assert';
import { useContext } from 'react';
import Player from '../classes/Player';
import PlayersInTownContext from '../contexts/PlayersInTownContext';

/**
 * This hook provides access to the list of all player objects in the town.
 * 
 * Components that use this hook will be re-rendered each time that the list of players in the town
 * changes (e.g. as players come and go).
 * 
 * Components that use this hook will NOT be re-rendered each time that a player moves,
 * see usePlayerMovement if that is necessary
 */
export default function usePlayersInTown(): Player[] {
  const ctx = useContext(PlayersInTownContext);
  assert(ctx, 'PlayersInTownContext context should be defined.');
  return ctx;
}
