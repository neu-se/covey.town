import dotenv from 'dotenv';
import Twilio from 'twilio';
import assert from 'assert';
import IVideoClient from './IVideoClient';

dotenv.config();

// 4 hours: each client will time out after 4 hours of video and need to refresh
const MAX_ALLOWED_SESSION_DURATION = 14400;

export default class TwilioVideo implements IVideoClient {
  private _twilioClient: Twilio.Twilio;

  private static _instance: TwilioVideo;

  private _twilioAccountSid: string;

  private _twilioApiKeySID: string;

  private _twilioApiKeySecret: string;

  constructor(twilioAccountSid: string,
    twilioAuthToken: string,
    twilioAPIKeySID: string,
    twilioAPIKeySecret: string) {
    this._twilioAccountSid = twilioAccountSid;
    this._twilioApiKeySID = twilioAPIKeySID;
    this._twilioApiKeySecret = twilioAPIKeySecret;
    this._twilioClient = Twilio(twilioAccountSid, twilioAuthToken);
  }

  public static getInstance(): TwilioVideo {
    if (!TwilioVideo._instance) {
      assert(process.env.TWILIO_API_AUTH_TOKEN,
        'Environmental variable TWILIO_API_AUTH_TOKEN must be set');
      assert(process.env.TWILIO_ACCOUNT_SID,
        'Environmental variable TWILIO_ACCOUNT_SID must be set');
      assert(process.env.TWILIO_API_KEY_SID,
        'Environmental variable TWILIO_API_KEY_SID must be set');
      assert(process.env.TWILIO_API_KEY_SECRET,
        'Environmental variable TWILIO_API_KEY_SECRET must be set');
      TwilioVideo._instance = new TwilioVideo(
        process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_API_AUTH_TOKEN,
        process.env.TWILIO_API_KEY_SID, process.env.TWILIO_API_KEY_SECRET,
      );
    }
    return TwilioVideo._instance;
  }

  async getTokenForRoom(coveyRoomID: string, clientIdentity: string): Promise<string> {
    const token = new Twilio.jwt.AccessToken(
      this._twilioAccountSid, this._twilioApiKeySID, this._twilioApiKeySecret, {
        ttl: MAX_ALLOWED_SESSION_DURATION,
      },
    );
    // eslint-disable-next-line
    // @ts-ignore this is missing from the typedef, but valid as per the docs...
    token.identity = clientIdentity;
    const videoGrant = new Twilio.jwt.AccessToken.VideoGrant({ room: coveyRoomID });
    token.addGrant(videoGrant);

    return token.toJwt();
  }
}
