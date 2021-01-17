import React from 'react';
import DeviceSelectionScreen from './DeviceSelectionScreen/DeviceSelectionScreen';
import IntroContainer from '../IntroContainer/IntroContainer';
import { VideoRoom } from '../../../../../CoveyTypes';
import { JoinRoomResponse } from '../../../../../classes/Video/Video';

export default function PreJoinScreens(props: { room: VideoRoom; doLogin: (initData: JoinRoomResponse) => Promise<boolean>; setMediaError?(error: Error): void }) {
  return (
    <IntroContainer>
      <DeviceSelectionScreen room={props.room} doLogin={props.doLogin} setMediaError={props.setMediaError} />
    </IntroContainer>
  );
}
