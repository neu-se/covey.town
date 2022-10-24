import dotenv from 'dotenv';
import Twilio from 'twilio';
import { logError } from '../Utils';
import IVideoClient from './IVideoClient';

dotenv.config();

// 1 hour: each client will time out after 1 hour of video and need to refresh
const MAX_ALLOWED_SESSION_DURATION = 3600;
declare global {
  interface Error {
    code: undefined;
  }
}

const MISSING_TOKEN_NAME = 'missing';
export default class TwilioVideo implements IVideoClient {
  private static _instance: TwilioVideo;

  private _twilioAccountSid: string;

  private _twilioApiKeySID: string;

  private _twilioApiKeySecret: string;

  private constructor(
    twilioAccountSid: string,
    twilioAPIKeySID: string,
    twilioAPIKeySecret: string,
  ) {
    this._twilioAccountSid = twilioAccountSid;
    this._twilioApiKeySID = twilioAPIKeySID;
    this._twilioApiKeySecret = twilioAPIKeySecret;
  }

  public static getInstance(): TwilioVideo {
    if (!TwilioVideo._instance) {
      TwilioVideo._instance = new TwilioVideo(
        process.env.TWILIO_ACCOUNT_SID || MISSING_TOKEN_NAME,
        process.env.TWILIO_API_KEY_SID || MISSING_TOKEN_NAME,
        process.env.TWILIO_API_KEY_SECRET || MISSING_TOKEN_NAME,
      );
    }
    return TwilioVideo._instance;
  }

  async getTokenForTown(coveyTownID: string, clientIdentity: string): Promise<string> {
    if (
      this._twilioAccountSid === MISSING_TOKEN_NAME ||
      this._twilioApiKeySID === MISSING_TOKEN_NAME ||
      this._twilioApiKeySecret === MISSING_TOKEN_NAME
    ) {
      logError(
        'Twilio tokens missing. Video chat will be disabled, and viewing areas will not work. Please be sure to configure the variables in the townService .env file as described in the README',
      );
      return MISSING_TOKEN_NAME;
    }
    const token = new Twilio.jwt.AccessToken(
      this._twilioAccountSid,
      this._twilioApiKeySID,
      this._twilioApiKeySecret,
      {
        ttl: MAX_ALLOWED_SESSION_DURATION,
      },
    );
    token.identity = clientIdentity;
    const videoGrant = new Twilio.jwt.AccessToken.VideoGrant({ room: coveyTownID });
    token.addGrant(videoGrant);
    return token.toJwt();
  }
}
