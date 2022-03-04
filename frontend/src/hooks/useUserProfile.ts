import { useContext } from 'react';
import assert from 'assert';
import UserContext from '../contexts/UserProfileContext';
import { UserProfile } from '../CoveyTypes';

/**
 * Use this hook to access the current user profile.
 * 
 * Not currently used; candidate to be refactored away.
 *
 */
export default function useUserProfile(): UserProfile {
  const ctx = useContext(UserContext);
  assert(ctx, 'User profile should be defined.');
  return ctx;
}
