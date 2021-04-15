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
  useSavedAudio?: boolean;
  setMediaError?(error: Error): void;
  setMuted?(muted: boolean): void;
}) {
  const { isEnabled: isAudioEnabled, toggleAudioEnabled } = useLocalAudioToggle();
  const lastClickTimeRef = useRef(0);
  const hasAudioDevices = useHasAudioInputDevices();
  const shouldUnmute = props.useSavedAudio !== undefined ? props.useSavedAudio : isAudioEnabled;

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

  if (shouldUnmute !== isAudioEnabled && hasAudioDevices) {
    toggleAudio();
  }
  if (props.setMuted) {
    props.setMuted(shouldUnmute);
  }

  return (
    <Button
      className={props.className}
      onClick={toggleAudio}
      disabled={props.disabled || !hasAudioDevices}
      startIcon={shouldUnmute ? <MicIcon /> : <MicOffIcon />}
      data-cy-audio-toggle
    >
      {!hasAudioDevices ? 'No audio devices' : shouldUnmute ? 'Mute' : 'Unmute'}
    </Button>
  );
}
