import assert from 'assert';
import { useContext } from 'react';
import Player from '../classes/Player';
import PlayersInTownContext from '../contexts/PlayersInTownContext';

export default function usePlayersInTown(): Player[] {
  const ctx = useContext(PlayersInTownContext);
  assert(ctx, 'PlayersInTownContext context should be defined.');
  return ctx;
}
