'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                  ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
var dotenv_1 = __importDefault(require('dotenv'));
var twilio_1 = __importDefault(require('twilio'));
var assert_1 = __importDefault(require('assert'));
dotenv_1.default.config();
var MAX_ALLOWED_SESSION_DURATION = 3600;
var TwilioVideo = (function () {
  function TwilioVideo(twilioAccountSid, twilioAuthToken, twilioAPIKeySID, twilioAPIKeySecret) {
    this._twilioAccountSid = twilioAccountSid;
    this._twilioApiKeySID = twilioAPIKeySID;
    this._twilioApiKeySecret = twilioAPIKeySecret;
    this._twilioClient = twilio_1.default(twilioAccountSid, twilioAuthToken);
  }
  TwilioVideo.getInstance = function () {
    if (!TwilioVideo._instance) {
      assert_1.default(
        process.env.TWILIO_API_AUTH_TOKEN,
        'Environmental variable TWILIO_API_AUTH_TOKEN must be set',
      );
      assert_1.default(
        process.env.TWILIO_ACCOUNT_SID,
        'Environmental variable TWILIO_ACCOUNT_SID must be set',
      );
      assert_1.default(
        process.env.TWILIO_API_KEY_SID,
        'Environmental variable TWILIO_API_KEY_SID must be set',
      );
      assert_1.default(
        process.env.TWILIO_API_KEY_SECRET,
        'Environmental variable TWILIO_API_KEY_SECRET must be set',
      );
      TwilioVideo._instance = new TwilioVideo(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_AUTH_TOKEN,
        process.env.TWILIO_API_KEY_SID,
        process.env.TWILIO_API_KEY_SECRET,
      );
    }
    return TwilioVideo._instance;
  };
  TwilioVideo.prototype.getTokenForTown = function (coveyTownID, clientIdentity) {
    return __awaiter(this, void 0, void 0, function () {
      var token, videoGrant;
      return __generator(this, function (_a) {
        token = new twilio_1.default.jwt.AccessToken(
          this._twilioAccountSid,
          this._twilioApiKeySID,
          this._twilioApiKeySecret,
          {
            ttl: MAX_ALLOWED_SESSION_DURATION,
          },
        );
        token.identity = clientIdentity;
        videoGrant = new twilio_1.default.jwt.AccessToken.VideoGrant({ room: coveyTownID });
        token.addGrant(videoGrant);
        return [2, token.toJwt()];
      });
    });
  };
  return TwilioVideo;
})();
exports.default = TwilioVideo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHdpbGlvVmlkZW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL1R3aWxpb1ZpZGVvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsa0RBQTRCO0FBQzVCLGtEQUE0QjtBQUM1QixrREFBNEI7QUFHNUIsZ0JBQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUdoQixJQUFNLDRCQUE0QixHQUFHLElBQUksQ0FBQztBQUUxQztJQVdFLHFCQUFZLGdCQUF3QixFQUNsQyxlQUF1QixFQUN2QixlQUF1QixFQUN2QixrQkFBMEI7UUFDMUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1FBQzFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7UUFDeEMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDO1FBQzlDLElBQUksQ0FBQyxhQUFhLEdBQUcsZ0JBQU0sQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRWEsdUJBQVcsR0FBekI7UUFDRSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRTtZQUMxQixnQkFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQ3RDLDBEQUEwRCxDQUFDLENBQUM7WUFDOUQsZ0JBQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUNuQyx1REFBdUQsQ0FBQyxDQUFDO1lBQzNELGdCQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFDbkMsdURBQXVELENBQUMsQ0FBQztZQUMzRCxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQ3RDLDBEQUEwRCxDQUFDLENBQUM7WUFDOUQsV0FBVyxDQUFDLFNBQVMsR0FBRyxJQUFJLFdBQVcsQ0FDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUNqRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQ2xFLENBQUM7U0FDSDtRQUNELE9BQU8sV0FBVyxDQUFDLFNBQVMsQ0FBQztJQUMvQixDQUFDO0lBRUsscUNBQWUsR0FBckIsVUFBc0IsV0FBbUIsRUFBRSxjQUFzQjs7OztnQkFDekQsS0FBSyxHQUFHLElBQUksZ0JBQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUN0QyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtvQkFDdkUsR0FBRyxFQUFFLDRCQUE0QjtpQkFDbEMsQ0FDRixDQUFDO2dCQUdGLEtBQUssQ0FBQyxRQUFRLEdBQUcsY0FBYyxDQUFDO2dCQUMxQixVQUFVLEdBQUcsSUFBSSxnQkFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBQ2hGLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRTNCLFdBQU8sS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFDOzs7S0FDdEI7SUFDSCxrQkFBQztBQUFELENBQUMsQUFyREQsSUFxREMifQ==
