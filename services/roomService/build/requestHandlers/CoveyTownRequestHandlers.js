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
exports.townSubscriptionHandler = exports.townUpdateHandler = exports.townDeleteHandler = exports.townCreateHandler = exports.townListHandler = exports.townJoinHandler = void 0;
var assert_1 = __importDefault(require('assert'));
var Player_1 = __importDefault(require('../types/Player'));
var CoveyTownsStore_1 = __importDefault(require('../lib/CoveyTownsStore'));
function townJoinHandler(requestData) {
  return __awaiter(this, void 0, void 0, function () {
    var townsStore, coveyTownController, newPlayer, newSession;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          townsStore = CoveyTownsStore_1.default.getInstance();
          coveyTownController = townsStore.getControllerForTown(requestData.coveyTownID);
          if (!coveyTownController) {
            return [
              2,
              {
                isOK: false,
                message: 'Error: No such town',
              },
            ];
          }
          newPlayer = new Player_1.default(
            requestData.userName,
            requestData.isLoggedIn,
            requestData.userID,
          );
          return [4, coveyTownController.addPlayer(newPlayer)];
        case 1:
          newSession = _a.sent();
          assert_1.default(newSession.videoToken);
          return [
            2,
            {
              isOK: true,
              response: {
                coveyUserID: newPlayer.id,
                coveySessionToken: newSession.sessionToken,
                providerVideoToken: newSession.videoToken,
                currentPlayers: coveyTownController.players,
                friendlyName: coveyTownController.friendlyName,
                isPubliclyListed: coveyTownController.isPubliclyListed,
              },
            },
          ];
      }
    });
  });
}
exports.townJoinHandler = townJoinHandler;
function townListHandler() {
  return __awaiter(this, void 0, void 0, function () {
    var townsStore;
    return __generator(this, function (_a) {
      townsStore = CoveyTownsStore_1.default.getInstance();
      return [
        2,
        {
          isOK: true,
          response: { towns: townsStore.getTowns() },
        },
      ];
    });
  });
}
exports.townListHandler = townListHandler;
function townCreateHandler(requestData) {
  return __awaiter(this, void 0, void 0, function () {
    var townsStore, newTown;
    return __generator(this, function (_a) {
      townsStore = CoveyTownsStore_1.default.getInstance();
      if (requestData.friendlyName.length === 0) {
        return [
          2,
          {
            isOK: false,
            message: 'FriendlyName must be specified',
          },
        ];
      }
      newTown = townsStore.createTown(requestData.friendlyName, requestData.isPubliclyListed);
      return [
        2,
        {
          isOK: true,
          response: {
            coveyTownID: newTown.coveyTownID,
            coveyTownPassword: newTown.townUpdatePassword,
          },
        },
      ];
    });
  });
}
exports.townCreateHandler = townCreateHandler;
function townDeleteHandler(requestData) {
  return __awaiter(this, void 0, void 0, function () {
    var townsStore, success;
    return __generator(this, function (_a) {
      townsStore = CoveyTownsStore_1.default.getInstance();
      success = townsStore.deleteTown(requestData.coveyTownID, requestData.coveyTownPassword);
      return [
        2,
        {
          isOK: success,
          response: {},
          message: !success
            ? 'Invalid password. Please double check your town update password.'
            : undefined,
        },
      ];
    });
  });
}
exports.townDeleteHandler = townDeleteHandler;
function townUpdateHandler(requestData) {
  return __awaiter(this, void 0, void 0, function () {
    var townsStore, success;
    return __generator(this, function (_a) {
      townsStore = CoveyTownsStore_1.default.getInstance();
      success = townsStore.updateTown(
        requestData.coveyTownID,
        requestData.coveyTownPassword,
        requestData.friendlyName,
        requestData.isPubliclyListed,
      );
      return [
        2,
        {
          isOK: success,
          response: {},
          message: !success
            ? 'Invalid password or update values specified. Please double check your town update password.'
            : undefined,
        },
      ];
    });
  });
}
exports.townUpdateHandler = townUpdateHandler;
function townSocketAdapter(socket) {
  return {
    onPlayerMoved: function (movedPlayer) {
      socket.emit('playerMoved', movedPlayer);
    },
    onPlayerDisconnected: function (removedPlayer) {
      socket.emit('playerDisconnect', removedPlayer);
    },
    onPlayerJoined: function (newPlayer) {
      socket.emit('newPlayer', newPlayer);
    },
    onTownDestroyed: function () {
      socket.emit('townClosing');
      socket.disconnect(true);
    },
  };
}
function townSubscriptionHandler(socket) {
  var _a = socket.handshake.auth,
    token = _a.token,
    coveyTownID = _a.coveyTownID;
  var townController = CoveyTownsStore_1.default.getInstance().getControllerForTown(coveyTownID);
  var s =
    townController === null || townController === void 0
      ? void 0
      : townController.getSessionByToken(token);
  if (!s || !townController) {
    socket.disconnect(true);
    return;
  }
  var listener = townSocketAdapter(socket);
  townController.addTownListener(listener);
  socket.on('disconnect', function () {
    townController.removeTownListener(listener);
    townController.destroySession(s);
  });
  socket.on('playerMovement', function (movementData) {
    townController.updatePlayerLocation(s.player, movementData);
  });
}
exports.townSubscriptionHandler = townSubscriptionHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ292ZXlUb3duUmVxdWVzdEhhbmRsZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JlcXVlc3RIYW5kbGVycy9Db3ZleVRvd25SZXF1ZXN0SGFuZGxlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsa0RBQTRCO0FBRTVCLDJEQUFxQztBQUdyQywyRUFBcUQ7QUFpR3JELFNBQXNCLGVBQWUsQ0FBQyxXQUE0Qjs7Ozs7O29CQUMxRCxVQUFVLEdBQUcseUJBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFFM0MsbUJBQW1CLEdBQUcsVUFBVSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDckYsSUFBSSxDQUFDLG1CQUFtQixFQUFFO3dCQUN4QixXQUFPO2dDQUNMLElBQUksRUFBRSxLQUFLO2dDQUNYLE9BQU8sRUFBRSxxQkFBcUI7NkJBQy9CLEVBQUM7cUJBQ0g7b0JBRUssU0FBUyxHQUFHLElBQUksZ0JBQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUM1RSxXQUFNLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBQTs7b0JBQTNELFVBQVUsR0FBRyxTQUE4QztvQkFDakUsZ0JBQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQzlCLFdBQU87NEJBQ0wsSUFBSSxFQUFFLElBQUk7NEJBQ1YsUUFBUSxFQUFFO2dDQUNSLFdBQVcsRUFBRSxTQUFTLENBQUMsRUFBRTtnQ0FDekIsaUJBQWlCLEVBQUUsVUFBVSxDQUFDLFlBQVk7Z0NBQzFDLGtCQUFrQixFQUFFLFVBQVUsQ0FBQyxVQUFVO2dDQUN6QyxjQUFjLEVBQUUsbUJBQW1CLENBQUMsT0FBTztnQ0FDM0MsWUFBWSxFQUFFLG1CQUFt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
