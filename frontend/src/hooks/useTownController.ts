import { useContext } from 'react';
import assert from 'assert';
import TownController from '../classes/TownController';
import TownControllerContext from '../contexts/TownControllerContext';

/**
 * Use this hook to access the current TownController. This state will change
 * when a user joins a new town, or leaves a town. Use the controller to subscribe
 * to other kinds of events that take place within the context of a town.
 */
export default function useTownController(): TownController {
  const ctx = useContext(TownControllerContext);
  assert(ctx, 'TownController context should be defined in order to use this hook.');
  return ctx;
}
