import React, { useCallback, useRef } from 'react';

import Button from '@material-ui/core/Button';
import VideoOffIcon from '../../../icons/VideoOffIcon';
import VideoOnIcon from '../../../icons/VideoOnIcon';

import { useHasVideoInputDevices } from '../../../hooks/deviceHooks/deviceHooks';
import useLocalVideoToggle from '../../../hooks/useLocalVideoToggle/useLocalVideoToggle';

export default function ToggleVideoButton(props: {
  disabled?: boolean;
  className?: string;
  useSavedVideo?: boolean;
  setMediaError?(error: Error): void;
  setShowVideo?(showVideo: boolean): void;
}) {
  // @ts-ignore
  const { isEnabled: isVideoEnabled, toggleVideoEnabled } = useLocalVideoToggle();
  const lastClickTimeRef = useRef(0);
  const hasVideoDevices = useHasVideoInputDevices();
  const shouldShowVideo = props.useSavedVideo !== undefined ? props.useSavedVideo : isVideoEnabled;

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

  if (shouldShowVideo !== isVideoEnabled && hasVideoDevices) {
    toggleVideo();
  }
  if (props.setShowVideo) {
    props.setShowVideo(shouldShowVideo);
  }

  return (
    <Button
      className={props.className}
      onClick={toggleVideo}
      disabled={!hasVideoDevices || props.disabled}
      startIcon={shouldShowVideo ? <VideoOnIcon /> : <VideoOffIcon />}
    >
      {!hasVideoDevices ? 'No video devices' : shouldShowVideo ? 'Stop Video' : 'Start Video'}
    </Button>
  );
}
