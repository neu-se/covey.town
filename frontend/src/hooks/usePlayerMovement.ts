import assert from 'assert';
import { useContext } from 'react';
import PlayerMovementContext, { PlayerMovementCallback } from '../contexts/PlayerMovementContext';

export default function usePlayerMovement(): PlayerMovementCallback[] {
  const ctx = useContext(PlayerMovementContext);
  assert(ctx, 'Player movmeent context should be defined.');
  return ctx;
}
