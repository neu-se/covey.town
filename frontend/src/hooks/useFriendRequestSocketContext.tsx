import { useContext } from 'react';
import assert from 'assert';
import FriendRequestSocketContext from '../contexts/FriendRequestSocketContext';
import { SocketState } from '../CoveyTypes';

export default function useFriendRequestSocket(): SocketState {
    const ctx = useContext(FriendRequestSocketContext);
    assert(ctx, 'App context should be defined.');
    return ctx;
  }