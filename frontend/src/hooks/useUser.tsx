import assert from 'assert';
import { useContext } from 'react';
import UserContext from '../contexts/UserContext';
import { User } from '../CoveyTypes';

export default function useUser(): User {
  const ctx = useContext(UserContext);
  assert(ctx, 'App context should be defined.');
  return ctx;
}
