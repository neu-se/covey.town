import React, { useState } from 'react';
import { TownJoinResponse } from '../../classes/TownsServiceClient';
import MediaErrorSnackbar from '../VideoCall/VideoFrontend/components/PreJoinScreens/MediaErrorSnackbar/MediaErrorSnackbar';
import PreJoinScreens from '../VideoCall/VideoFrontend/components/PreJoinScreens/PreJoinScreens';

interface LoginProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>;
}

export default function Login({ doLogin }: LoginProps): JSX.Element {
  const [mediaError, setMediaError] = useState<Error>();

  return (
    <>
      <MediaErrorSnackbar error={mediaError} dismissError={() => setMediaError(undefined)} />
      <PreJoinScreens doLogin={doLogin} setMediaError={setMediaError} />
    </>
  );
}
