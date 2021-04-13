import React, { useCallback, useRef } from 'react';

import Button from '@material-ui/core/Button';
import VideoOffIcon from '../../../icons/VideoOffIcon';
import VideoOnIcon from '../../../icons/VideoOnIcon';

import { useHasVideoInputDevices } from '../../../hooks/deviceHooks/deviceHooks';
import useLocalVideoToggle from '../../../hooks/useLocalVideoToggle/useLocalVideoToggle';

export default function ToggleVideoButton(props: {
  disabled?: boolean;
  className?: string;
  setMediaError?(error: Error): void;
  savedVideoEnabled?: boolean;
}) {
  // @ts-ignore
  const { isEnabled: isVideoEnabled, toggleVideoEnabled } = useLocalVideoToggle();
  const lastClickTimeRef = useRef(0);
  const hasVideoDevices = useHasVideoInputDevices();
  const showVideo = props.savedVideoEnabled !== undefined ? props.savedVideoEnabled : isVideoEnabled;

  const toggleVideo = useCallback(async () => {
    if (Date.now() - lastClickTimeRef.current > 200) {
      lastClickTimeRef.current = Date.now();
      try {
        await toggleVideoEnabled();
      } catch (e) {
        if (props.setMediaError) {
          props.setMediaError(e);
        }
      }
    }
  }, [props, toggleVideoEnabled]);

  if (showVideo !== isVideoEnabled && hasVideoDevices) {
    toggleVideo();
  }

  return (
    <Button
      className={props.className}
      onClick={toggleVideo}
      disabled={!hasVideoDevices || props.disabled}
      startIcon={showVideo ? <VideoOnIcon /> : <VideoOffIcon />}
    >
      {!hasVideoDevices ? 'No video devices' : showVideo ? 'Stop Video' : 'Start Video'}
    </Button>
  );
}
