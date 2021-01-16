import DebugLogger from "../DebugLogger";
import assert from "assert";
import {UserLocation, VideoRoom} from "../../CoveyTypes";
import Player, {ServerPlayer} from "../Player";

export type JoinRoomResponse = {
    coveyUserID: string,
    coveySessionToken: string,
    providerVideoToken: string,
    currentPlayers: ServerPlayer[],
    message: string
}
export default class Video {
    private static video: Video | null = null;

    private logger: DebugLogger = new DebugLogger("Video");
    private socket: any;
    private myLocation?: UserLocation;

    private _REACT_APP_TWILIO_CALLBACK_URL: string | undefined = process.env.REACT_APP_TWILIO_CALLBACK_URL;

    private initialisePromise: Promise<JoinRoomResponse> | null = null;
    private teardownPromise: Promise<void> | null = null;
    private sessionToken?: string;
    private videoToken: string | null = null;
    private twilioRoomID: string | null = null;
    private _userName: string;

    constructor(userName: string
    ) {
        this._userName = userName;
    }

    get userName(){
        return this._userName;
    }

    public getTwilioRoomID(){
        return this.twilioRoomID;
    }

    private async setup(): Promise<JoinRoomResponse> {
        if (!this.initialisePromise) {
            this.initialisePromise = new Promise(async (resolve, reject) => {
                //Request our token to join the room

                const callbackUrl = await this.get_REACT_APP_TWILIO_CALLBACK_URL();
                const res = await fetch(
                    `${callbackUrl}/room/demoRoomGroup`,
                    {
                        method: 'POST',
                        body: JSON.stringify({userName: this._userName}),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                if (res.status !== 200) {
                    throw new Error(res.statusText);
                }
                const result = await res.json();
                console.log(result);
                this.sessionToken = result.coveySessionToken;
                this.videoToken = result.providerVideoToken;
                this.twilioRoomID = "demoRoomGroup";
                resolve(result);
            });
        }

        return this.initialisePromise;
    }

    private async teardown(): Promise<void> {
        if (!this.teardownPromise) {
            if (this.initialisePromise) {
                const doTeardown = async () => {
                    this.logger.info("Tearing down video client...");
                    this.logger.info("Tore down video client.");
                    this.initialisePromise = null;
                }

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

    // public async createVideoRoom(capacity: number, ephemeral: boolean, isPrivate: boolean, name: string, textChat?: TextChat): Promise<string> {
    //     return Parse.Cloud.run("videoRoom-create", {
    //         capacity,
    //         ephemeral,
    //         isPrivate,
    //         name,
    //         textChat: textChat?.id,
    //         conference: this.conference.id
    //     });
    // }
    //
    // public async inviteToRoom(room: VideoRoom, users: Array<string>): Promise<{ [k: string]: boolean }> {
    //     return Parse.Cloud.run("videoRoom-invite", {
    //         conference: this.conference.id,
    //         room: room.id,
    //         users,
    //         write: false
    //     });
    // }

    private async get_REACT_APP_TWILIO_CALLBACK_URL(): Promise<string> {
        if (!this._REACT_APP_TWILIO_CALLBACK_URL) {
            this.logger.warn("Twilio not configured.");
            throw new Error("Twilio not configured.");
        }
        // @ts-ignore
        return this._REACT_APP_TWILIO_CALLBACK_URL;
    }

    public async fetchFreshToken(room: VideoRoom): Promise<{
        token: string | null,
        expiry: Date | null,
        twilioRoomId: string | null
    }> {
        assert(this._userName);

        this.logger.info(`Fetching fresh video token for ${this._userName}`);

        const result = await this.requestClowdrTwilioBackend("token", {
            room: room.id
        });
        return {token: result.token, expiry: new Date(result.expiry), twilioRoomId: result.twilioRoomId};
    }

    public async requestClowdrTwilioBackend(
        endpoint: "token",
        data: any = {}
    ) {
        // assert(this.sessionToken);
        //
        // data.identity = this.sessionToken;
        //
        // const callbackUrl = await this.get_REACT_APP_TWILIO_CALLBACK_URL();
        // const res = await fetch(
        //     `${callbackUrl}/video/${endpoint}`,
        //     {
        //         method: 'POST',
        //         body: JSON.stringify(data),
        //         headers: {
        //             'Content-Type': 'application/json'
        //         }
        //     });
        // const result = await res.json();
        // if (res.status !== 200) {
        //     throw new Error(result.status);
        // }
        // return result;
        return {token: this.videoToken, expiry: new Date(), twilioRoomId: this.twilioRoomID};
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

        // @ts-ignore
        if (!window.clowdr) {
            // @ts-ignore
            window.clowdr = window.clowdr || {};
        }

        // @ts-ignore
        window.clowdr.video = Video.video;

        return result;
    }

    public static async teardown() {
        try {
            await Video.video?.teardown();
        } finally {
            Video.video = null;
            // @ts-ignore
            if (window.clowdr && window.clowdr.video) {
                // @ts-ignore
                window.clowdr.video = null;
            }
        }
    }

    public static instance(): Video | null {
        return Video.video;
    }


}
