import { useContext } from 'react';
import assert from 'assert';
import IAuth from '../components/Authentication/IAuth';
import AuthenticationContext from '../contexts/AuthenticationContext';

export default function useAuthentication(): IAuth {
    const ctx = useContext(AuthenticationContext);
    assert(ctx, 'App context should be defined.');
    return ctx;
  }