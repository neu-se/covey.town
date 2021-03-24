import assert from 'assert';
import { useContext } from 'react';
import AuthInfoContext from '../contexts/AuthInfoContext';
import { AuthInfo } from '../CoveyTypes';

export default function useAuthInfo(): AuthInfo {
  const ctx = useContext(AuthInfoContext);
  assert(ctx, 'App context should be defined.');
  return ctx;
}
