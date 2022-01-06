import React from 'react';
import { TownJoinResponse } from '../../classes/TownsServiceClient';
import PreJoinScreens from '../VideoCall/VideoFrontend/components/PreJoinScreens/PreJoinScreens';

interface LoginProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}

export default function Login({ doLogin }: LoginProps): JSX.Element {
  return (
    <>
      <PreJoinScreens
        doLogin={doLogin}
      />
    </>
  );
}
