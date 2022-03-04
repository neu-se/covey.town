import { useContext } from 'react';
import assert from 'assert';
import CoveyAppContext from '../contexts/CoveyAppContext';
import { CoveyAppState } from '../CoveyTypes';

/**
 * Use this hook to access the current state about the town that the user is connected to.
 * It provides access to the user's information (session token, username etc), and the town's 
 * information (town ID, friendly name, etc.)
 * 
 * It also contains other properties that are scheduled to be refactored out eventually: a reference
 * to the socket connection, an API client, and reference to a global callback to emit a player movement event. 
 */
export default function useCoveyAppState(): CoveyAppState {
  const ctx = useContext(CoveyAppContext);
  assert(ctx, 'App context should be defined.');
  return ctx;
}
