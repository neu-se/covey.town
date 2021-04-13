import React, { useCallback, useRef } from 'react';

import Button from '@material-ui/core/Button';
import MicIcon from '../../../icons/MicIcon';
import MicOffIcon from '../../../icons/MicOffIcon';

import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import { useHasAudioInputDevices } from '../../../hooks/deviceHooks/deviceHooks';

// add another prop, use that to set the use audio/video instead of use local audio toggle
export default function ToggleAudioButton(props: {
  disabled?: boolean;
  className?: string;
  savedAudioEnabled?: boolean;
  setMediaError?(error: Error): void;
}) {
  const { isEnabled: isAudioEnabled, toggleAudioEnabled } = useLocalAudioToggle();
  const lastClickTimeRef = useRef(0);
  const hasAudioDevices = useHasAudioInputDevices();
  const isUnmuted = props.savedAudioEnabled !== undefined ? props.savedAudioEnabled : isAudioEnabled;

  const toggleAudio = useCallback(async () => {
    if (Date.now() - lastClickTimeRef.current > 200) {
      lastClickTimeRef.current = Date.now();
      try {
        await toggleAudioEnabled();
      } catch (e) {
        if (props.setMediaError) {
          props.setMediaError(e);
        }
      }
    }
  }, [props, toggleAudioEnabled]);

  if (isUnmuted !== isAudioEnabled && hasAudioDevices) {
    toggleAudio();
  }

  return (
    <Button
      className={props.className}
      onClick={toggleAudio}
      disabled={props.disabled || !hasAudioDevices}
      startIcon={isUnmuted ? <MicIcon /> : <MicOffIcon />}
      data-cy-audio-toggle
    >
      {!hasAudioDevices ? 'No audio devices' : isUnmuted ? 'Mute' : 'Unmute'}
    </Button>
  );
}
