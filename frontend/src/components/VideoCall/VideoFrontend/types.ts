import {BandwidthProfileOptions, LocalTrack, LocalVideoTrack, RemoteVideoTrack, Track, TwilioError} from 'twilio-video';
import { EventEmitter } from 'events';

declare module 'twilio-video' {
  interface LocalParticipant {
    setBandwidthProfile: (bandwidthProfile: BandwidthProfileOptions) => void;
    publishTrack(track: LocalTrack, options?: { priority: Track.Priority }): Promise<LocalTrackPublication>;
  }

  interface VideoCodecSettings {
    simulcast?: boolean;
  }

  interface LocalTrackPublication {
    setPriority: (priority: Track.Priority) => LocalTrackPublication;
  }

  interface LocalVideoTrack {
    isSwitchedOff: undefined;
    setPriority: undefined;
  }

  interface RemoteVideoTrack {
    isSwitchedOff: boolean;
    setPriority: (priority: Track.Priority) => RemoteVideoTrack;
  }

  interface VideoBandwidthProfileOptions {
    trackSwitchOffMode?: 'predicted' | 'detected' | 'disabled';
  }
}

declare global {
  interface Window {
    readonly visualViewport: VisualViewport
  }

  interface MediaDevices {
    getDisplayMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
  }

  interface HTMLMediaElement {
    setSinkId?(sinkId: string): Promise<undefined>;
  }
}

export type Callback = (...args: any[]) => void;

export type ErrorCallback = (error: TwilioError) => void;

export type IVideoTrack = LocalVideoTrack | RemoteVideoTrack;

export type RoomType = 'group' | 'group-small' | 'peer-to-peer' | 'go';
