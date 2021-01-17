import { useContext } from 'react';
import assert from 'assert';
import CoveyAppContext from '../contexts/CoveyAppContext';
import { CoveyAppState } from '../CoveyTypes';

/**
 * Use this hook to access the current user profile.
 *
 * To access the User class from the data layer, use this hook to get the user
 * current profile, then utilise its `user` field.
 *
 * To access the User class from parse, use
 * `Parse.User.currentAsync().then(...)`
 *
 * Use this hook if your component can only render when the user is logged in.
 * Otherwise, use the `useMaybeUser` hook.
 */
export default function useCoveyAppState(): CoveyAppState {
  const ctx = useContext(CoveyAppContext);
  assert(ctx, 'App context should be defined.');
  return ctx;
}
