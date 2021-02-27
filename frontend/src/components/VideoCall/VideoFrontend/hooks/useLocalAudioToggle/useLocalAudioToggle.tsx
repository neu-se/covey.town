import { useCallback, useEffect, useState } from 'react';
import LocalStorage_TwilioVideo from '../../../../../classes/LocalStorage/TwilioVideo';
import useIsTrackEnabled from '../useIsTrackEnabled/useIsTrackEnabled';
import useVideoContext from '../useVideoContext/useVideoContext';

export default function useLocalAudioToggle() {
  const {
    // @ts-ignore
    localAudioTrack: audioTrack,
    room: { localParticipant },
    getLocalAudioTrack,
    // @ts-ignore
    removeLocalAudioTrack,
  } = useVideoContext();
  const isEnabled = useIsTrackEnabled(audioTrack);
  const [isPublishing, setIsPublishing] = useState(false);

  const stopAudio = useCallback(() => {
    if (audioTrack) {
      LocalStorage_TwilioVideo.twilioVideoLastMic = audioTrack.mediaStreamTrack.getSettings().deviceId ?? null;
      const localTrackPublication = localParticipant?.unpublishTrack(audioTrack);
      // TODO: remove when SDK implements this event. See: https://issues.corp.twilio.com/browse/JSDK-2592
      localParticipant?.emit('trackUnpublished', localTrackPublication);
      removeLocalAudioTrack();
    }
  }, [audioTrack, localParticipant, removeLocalAudioTrack]);

  const toggleAudioEnabled = useCallback(async () => {
    if (!isPublishing) {
      if (audioTrack) {
        stopAudio();
        LocalStorage_TwilioVideo.twilioVideoMicEnabled = false;
      } else {
        setIsPublishing(true);
        try {
          LocalStorage_TwilioVideo.twilioVideoMicEnabled = true;
          const track = await getLocalAudioTrack(LocalStorage_TwilioVideo.twilioVideoLastMic ?? undefined);
          localParticipant?.publishTrack(track, { priority: 'low' });
        } catch (e) {
          if (e?.name === 'NotReadableError' || e?.name === 'OverconstrainedError') {
            LocalStorage_TwilioVideo.twilioVideoLastMic = null;
          }
          throw e;
        } finally {
          setIsPublishing(false);
        }
      }
    }
  }, [audioTrack, getLocalAudioTrack, isPublishing, localParticipant, stopAudio]);

  return { isEnabled, toggleAudioEnabled, stopAudio } as const;
}
