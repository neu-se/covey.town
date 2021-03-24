import DebugLogger from '../DebugLogger';
import TownsServiceClient, { TownJoinResponse } from '../TownsServiceClient';

export default class Video {
  private static video: Video | null = null;

  private logger: DebugLogger = new DebugLogger('Video');

  private initialisePromise: Promise<TownJoinResponse> | null = null;

  private teardownPromise: Promise<void> | null = null;

  private sessionToken?: string;

  private videoToken: string | null = null;

  private _userName: string;

  private townsServiceClient: TownsServiceClient = new TownsServiceClient();

  private _coveyTownID: string;

  private _townFriendlyName: string | undefined;

  private _isPubliclyListed: boolean | undefined;

  private _isMergeable: boolean | undefined;

  pauseGame: () => void = ()=>{};

  unPauseGame: () => void = ()=>{};

  constructor(userName: string, coveyTownID: string) {
    this._userName = userName;
    this._coveyTownID = coveyTownID;
  }

  get isPubliclyListed(): boolean {
    if (this._isPubliclyListed === true) {
      return true;
    }
    return false;
  }

  get isMergeable(): boolean {
    if (this._isMergeable === true) {
      return true;
    }
    return false;
  }

  get townFriendlyName(): string | undefined {
    return this._townFriendlyName;
  }

  get userName(): string {
    return this._userName;
  }

  get coveyTownID(): string {
    return this._coveyTownID;
  }

  private async setup(): Promise<TownJoinResponse> {
    if (!this.initialisePromise) {
      this.initialisePromise = new Promise((resolve, reject) => {
        // Request our token to join the town
        this.townsServiceClient.joinTown({
          coveyTownID: this._coveyTownID,
          userName: this._userName,
        })
          .then((result) => {
            this.sessionToken = result.coveySessionToken;
            this.videoToken = result.providerVideoToken;
            this._townFriendlyName = result.friendlyName;
            this._isPubliclyListed = result.isPubliclyListed;
            resolve(result);
          })
          .catch((err) => {
            reject(err);
          });
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

  public static async setup(username: string, coveyTownID: string): Promise<TownJoinResponse> {
    let result = null;

    if (!Video.video) {
      Video.video = new Video(username, coveyTownID);
    }

    try {
      result = await Video.video.setup();
      if (!result) {
        Video.video = null;
      }
    } catch (err) {
      Video.video = null;
      throw err;
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
