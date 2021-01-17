import DebugLogger from '../DebugLogger';
import { ServerPlayer, UserLocation } from '../Player';

export type JoinRoomResponse = {
  coveyUserID: string,
  coveySessionToken: string,
  providerVideoToken: string,
  currentPlayers: ServerPlayer[],
  message: string
};
export default class Video {
  private static video: Video | null = null;

  private logger: DebugLogger = new DebugLogger('Video');

  private socket: any;

  private myLocation?: UserLocation;

  private _REACT_APP_TWILIO_CALLBACK_URL: string |
  undefined = process.env.REACT_APP_TWILIO_CALLBACK_URL;

  private initialisePromise: Promise<JoinRoomResponse> | null = null;

  private teardownPromise: Promise<void> | null = null;

  private sessionToken?: string;

  private videoToken: string | null = null;

  private twilioRoomID: string | null = null;

  private _userName: string;

  constructor(userName: string) {
    this._userName = userName;
  }

  get userName(): string {
    return this._userName;
  }

  public getTwilioRoomID(): string | null {
    return this.twilioRoomID;
  }

  private async setup(): Promise<JoinRoomResponse> {
    if (!this.initialisePromise) {
      this.initialisePromise = new Promise((resolve, reject) => {
        // Request our token to join the room
        this.get_REACT_APP_TWILIO_CALLBACK_URL().then(async (callbackUrl) => {
          const res = await fetch(
            `${callbackUrl}/room/demoRoomGroup`,
            {
              method: 'POST',
              body: JSON.stringify({ userName: this._userName }),
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );
          if (res.status !== 200) {
            reject(new Error(res.statusText));
            return;
          }
          const result = await res.json();
          this.sessionToken = result.coveySessionToken;
          this.videoToken = result.providerVideoToken;
          this.twilioRoomID = 'demoRoomGroup';
          resolve(result);
        }).catch((err) => reject(err));
      });
    }

    return this.initialisePromise;
  }

  private async teardown(): Promise<void> {
    if (!this.teardownPromise) {
      if (this.initialisePromise) {
        const doTeardown = async () => {
          this.logger.info('Tearing down video client...');
          this.logger.info('Tore down video client.');
          this.initialisePromise = null;
        };

        this.teardownPromise = this.initialisePromise.then(async () => {
          await doTeardown();
        }).catch(async (err) => {
          this.logger.warn("Ignoring video initialisation error as we're teraing down anyway.", err);
          await doTeardown();
        });
      } else {
        return Promise.resolve();
      }
    }

    return this.teardownPromise ?? Promise.resolve();
  }

  private async get_REACT_APP_TWILIO_CALLBACK_URL(): Promise<string> {
    if (!this._REACT_APP_TWILIO_CALLBACK_URL) {
      this.logger.warn('Twilio not configured.');
      throw new Error('Twilio not configured.');
    }
    return this._REACT_APP_TWILIO_CALLBACK_URL;
  }

  public static async setup(username: string): Promise<JoinRoomResponse> {
    let result = null;

    if (!Video.video) {
      Video.video = new Video(username);
    }

    result = await Video.video.setup();

    if (!result) {
      Video.video = null;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - JB TODO
    if (!window.clowdr) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - JB TODO
      window.clowdr = window.clowdr || {};
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - JB TODO
    window.clowdr.video = Video.video;

    return result;
  }

  public static async teardown(): Promise<void> {
    try {
      await Video.video?.teardown();
    } finally {
      Video.video = null;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - JB TODO
      if (window.clowdr && window.clowdr.video) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - JB TODO
        window.clowdr.video = null;
      }
    }
  }

  public static instance(): Video | null {
    return Video.video;
  }
}
