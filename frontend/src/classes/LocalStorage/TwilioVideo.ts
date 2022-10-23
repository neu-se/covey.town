export default class TwilioVideo {
  private static readonly _twilioVideoCameraEnabledKey = 'twilioVideoCameraEnabled';

  private static readonly _twilioVideoMicEnabledKey = 'twilioVideoMicEnabled';

  private static readonly _twilioVideoLastCameraKey = 'twilioVideoLastCamera';

  private static readonly _twilioVideoLastMicKey = 'twilioVideoLastMic';

  static get twilioVideoCameraEnabled(): boolean | null {
    return localStorage.getItem(TwilioVideo._twilioVideoCameraEnabledKey) === 'true';
  }

  static set twilioVideoCameraEnabled(value: boolean | null) {
    if (value !== null) {
      localStorage.setItem(
        TwilioVideo._twilioVideoCameraEnabledKey,
        value === true ? 'true' : 'false',
      );
    } else {
      localStorage.removeItem(TwilioVideo._twilioVideoCameraEnabledKey);
    }
  }

  static get twilioVideoMicEnabled(): boolean | null {
    return localStorage.getItem(TwilioVideo._twilioVideoMicEnabledKey) === 'true';
  }

  static set twilioVideoMicEnabled(value: boolean | null) {
    if (value !== null) {
      localStorage.setItem(
        TwilioVideo._twilioVideoMicEnabledKey,
        value === true ? 'true' : 'false',
      );
    } else {
      localStorage.removeItem(TwilioVideo._twilioVideoMicEnabledKey);
    }
  }

  static get twilioVideoLastCamera(): string | null {
    return localStorage.getItem(TwilioVideo._twilioVideoLastCameraKey);
  }

  static set twilioVideoLastCamera(value: string | null) {
    if (value) {
      localStorage.setItem(TwilioVideo._twilioVideoLastCameraKey, value);
    } else {
      localStorage.removeItem(TwilioVideo._twilioVideoLastCameraKey);
    }
  }

  static get twilioVideoLastMic(): string | null {
    return localStorage.getItem(TwilioVideo._twilioVideoLastMicKey);
  }

  static set twilioVideoLastMic(value: string | null) {
    if (value) {
      localStorage.setItem(TwilioVideo._twilioVideoLastMicKey, value);
    } else {
      localStorage.removeItem(TwilioVideo._twilioVideoLastMicKey);
    }
  }
}
