import React, { useState } from 'react';
import PreJoinScreens from '../VideoCall/VideoFrontend/components/PreJoinScreens/PreJoinScreens';
import { JoinRoomResponse } from '../../classes/Video/Video';
import MediaErrorSnackbar
  from '../VideoCall/VideoFrontend/components/PreJoinScreens/MediaErrorSnackbar/MediaErrorSnackbar';

interface LoginProps {
  doLogin: (initData: JoinRoomResponse) => Promise<boolean>
}

export default function Login({ doLogin }: LoginProps): JSX.Element {
  const [mediaError, setMediaError] = useState<Error>();

  return (
    <>
      <MediaErrorSnackbar error={mediaError} dismissError={() => setMediaError(undefined)} />
      <PreJoinScreens
        doLogin={doLogin}
        room={{
          id: 'demoRoom',
          twilioID: 'none',
        }}
        setMediaError={setMediaError}
      />
    </>
  );
}
