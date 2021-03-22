import assert from 'assert';
import { useContext } from 'react';
import UserContext from '../contexts/UserContext';
import { AuthState } from '../CoveyTypes';

export default function useUser(): AuthState {
  const ctx = useContext(UserContext);
  assert(ctx, 'App context should be defined.');
  return ctx;
}
