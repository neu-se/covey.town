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
var nanoid_1 = require('nanoid');
var PlayerSession_1 = __importDefault(require('../types/PlayerSession'));
var TwilioVideo_1 = __importDefault(require('./TwilioVideo'));
var friendlyNanoID = nanoid_1.customAlphabet('1234567890ABCDEF', 8);
var CoveyTownController = (function () {
  function CoveyTownController(friendlyName, isPubliclyListed) {
    this._players = [];
    this._sessions = [];
    this._videoClient = TwilioVideo_1.default.getInstance();
    this._listeners = [];
    this._coveyTownID = process.env.DEMO_TOWN_ID === friendlyName ? friendlyName : friendlyNanoID();
    this._capacity = 50;
    this._townUpdatePassword = nanoid_1.nanoid(24);
    this._isPubliclyListed = isPubliclyListed;
    this._friendlyName = friendlyName;
  }
  Object.defineProperty(CoveyTownController.prototype, 'capacity', {
    get: function () {
      return this._capacity;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(CoveyTownController.prototype, 'isPubliclyListed', {
    get: function () {
      return this._isPubliclyListed;
    },
    set: function (value) {
      this._isPubliclyListed = value;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(CoveyTownController.prototype, 'townUpdatePassword', {
    get: function () {
      return this._townUpdatePassword;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(CoveyTownController.prototype, 'players', {
    get: function () {
      return this._players;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(CoveyTownController.prototype, 'occupancy', {
    get: function () {
      return this._listeners.length;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(CoveyTownController.prototype, 'friendlyName', {
    get: function () {
      return this._friendlyName;
    },
    set: function (value) {
      this._friendlyName = value;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(CoveyTownController.prototype, 'coveyTownID', {
    get: function () {
      return this._coveyTownID;
    },
    enumerable: false,
    configurable: true,
  });
  CoveyTownController.prototype.addPlayer = function (newPlayer) {
    return __awaiter(this, void 0, void 0, function () {
      var theSession, _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            theSession = new PlayerSession_1.default(newPlayer);
            this._sessions.push(theSession);
            this._players.push(newPlayer);
            _a = theSession;
            return [4, this._videoClient.getTokenForTown(this._coveyTownID, newPlayer.id)];
          case 1:
            _a.videoToken = _b.sent();
            this._listeners.forEach(function (listener) {
              return listener.onPlayerJoined(newPlayer);
            });
            return [2, theSession];
        }
      });
    });
  };
  CoveyTownController.prototype.destroySession = function (session) {
    this._players = this._players.filter(function (p) {
      return p.id !== session.player.id;
    });
    this._sessions = this._sessions.filter(function (s) {
      return s.sessionToken !== session.sessionToken;
    });
    this._listeners.forEach(function (listener) {
      return listener.onPlayerDisconnected(session.player);
    });
  };
  CoveyTownController.prototype.updatePlayerLocation = function (player, location) {
    player.updateLocation(location);
    this._listeners.forEach(function (listener) {
      return listener.onPlayerMoved(player);
    });
  };
  CoveyTownController.prototype.addTownListener = function (listener) {
    this._listeners.push(listener);
  };
  CoveyTownController.prototype.removeTownListener = function (listener) {
    this._listeners = this._listeners.filter(function (v) {
      return v !== listener;
    });
  };
  CoveyTownController.prototype.getSessionByToken = function (token) {
    return this._sessions.find(function (p) {
      return p.sessionToken === token;
    });
  };
  CoveyTownController.prototype.disconnectAllPlayers = function () {
    this._listeners.forEach(function (listener) {
      return listener.onTownDestroyed();
    });
  };
  return CoveyTownController;
})();
exports.default = CoveyTownController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ292ZXlUb3duQ29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvQ292ZXlUb3duQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFnRDtBQUloRCx5RUFBbUQ7QUFDbkQsOERBQXdDO0FBR3hDLElBQU0sY0FBYyxHQUFHLHVCQUFjLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFNN0Q7SUEwREUsNkJBQVksWUFBb0IsRUFBRSxnQkFBeUI7UUFyQm5ELGFBQVEsR0FBYSxFQUFFLENBQUM7UUFHeEIsY0FBUyxHQUFvQixFQUFFLENBQUM7UUFHaEMsaUJBQVksR0FBaUIscUJBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUd2RCxlQUFVLEdBQXdCLEVBQUUsQ0FBQztRQWEzQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFDbEcsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLGVBQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUM7UUFDMUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7SUFDcEMsQ0FBQztJQS9ERCxzQkFBSSx5Q0FBUTthQUFaO1lBQ0UsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3hCLENBQUM7OztPQUFBO0lBQ0Qsc0JBQUksaURBQWdCO2FBSXBCO1lBQ0UsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFDaEMsQ0FBQzthQU5ELFVBQXFCLEtBQWM7WUFDakMsSUFBSSxDQUFD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
