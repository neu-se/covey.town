import assert from 'assert';
import { useContext } from 'react';
import PlayerMovementContext, { PlayerMovementCallback } from '../contexts/PlayerMovementContext';

/**
 * This hook exposes direct access to the array of callbacks that the game invokes *every* time that
 * a player moves. Components that need to know when players move should register a callback by pushing
 * it into this array, and upon unmount, remove that callback by splicing it out of this array.
 * 
 * There be dragons here, this is a good long-term refactoring candidate.
 */
export default function usePlayerMovement(): PlayerMovementCallback[] {
  const ctx = useContext(PlayerMovementContext);
  assert(ctx, 'Player movmeent context should be defined.');
  return ctx;
}
