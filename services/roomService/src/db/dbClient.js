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
exports.__esModule = true;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
var mongodb_1 = require('mongodb');
var dbName = 'coveyTown';
var collectionName = 'users';
function getAllUserEmails(client) {
  return __awaiter(this, void 0, void 0, function () {
    var userEmails;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, client.db(dbName).collection(collectionName).distinct('email')];
        case 1:
          userEmails = _a.sent();
          return [2 /*return*/, userEmails];
      }
    });
  });
}
function userExistsWithEmail(client, email) {
  return __awaiter(this, void 0, void 0, function () {
    var emails;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, getAllUserEmails(client)];
        case 1:
          emails = _a.sent();
          return [2 /*return*/, emails.includes(email)];
      }
    });
  });
}
function getUserByEmail(client, email) {
  return __awaiter(this, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            client.db(dbName).collection(collectionName).findOne({ email: email }),
          ];
        case 1:
          user = _a.sent();
          return [2 /*return*/, user];
      }
    });
  });
}
function getOnlineStatus(client, email) {
  return __awaiter(this, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, getUserByEmail(client, email)];
        case 1:
          user = _a.sent();
          return [2 /*return*/, user.isOnline];
      }
    });
  });
}
function getAllFriends(client, email) {
  return __awaiter(this, void 0, void 0, function () {
    var user, friends, friendStatuses;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, getUserByEmail(client, email)];
        case 1:
          user = _a.sent();
          friends = user.friends;
          return [
            4 /*yield*/,
            client
              .db(dbName)
              .collection(collectionName)
              .find({ email: { $in: friends } })
              .project({ email: 1, isOnline: 1, _id: 0 })
              .toArray(),
          ];
        case 2:
          friendStatuses = _a.sent();
          return [2 /*return*/, friendStatuses];
      }
    });
  });
}
function addFriend(client, email, friendEmail) {
  return __awaiter(this, void 0, void 0, function () {
    var user, friends, friendExists, shouldInsert;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, getUserByEmail(client, email)];
        case 1:
          user = _a.sent();
          friends = user.friends;
          return [4 /*yield*/, userExistsWithEmail(client, friendEmail)];
        case 2:
          friendExists = _a.sent();
          shouldInsert = !friends.includes(friendEmail) && friendExists && friendEmail !== email;
          if (!shouldInsert) return [3 /*break*/, 4];
          return [
            4 /*yield*/,
            client
              .db(dbName)
              .collection(collectionName)
              .updateOne({ email: email }, { $push: { friends: friendEmail } }),
          ];
        case 3:
          _a.sent();
          return [3 /*break*/, 5];
        case 4:
          console.log('friend not added');
          _a.label = 5;
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function insertUser(client, user) {
  return __awaiter(this, void 0, void 0, function () {
    var shouldInsert, insertedUser;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, userExistsWithEmail(client, user.email)];
        case 1:
          shouldInsert = !_a.sent();
          if (!shouldInsert) return [3 /*break*/, 3];
          return [4 /*yield*/, client.db(dbName).collection(collectionName).insertOne(user)];
        case 2:
          insertedUser = _a.sent();
          console.log('Inserted user: ', insertedUser);
          return [3 /*break*/, 4];
        case 3:
          console.log('user already exists');
          _a.label = 4;
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
function setStatusOnline(client, email) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            client
              .db(dbName)
              .collection(collectionName)
              .updateOne({ email: email }, { $set: { isOnline: true } }),
          ];
        case 1:
          _a.sent();
          return [2 /*return*/];
      }
    });
  });
}
function setStatusOffline(client, email) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            client
              .db(dbName)
              .collection(collectionName)
              .updateOne({ email: email }, { $set: { isOnline: false } }),
          ];
        case 1:
          _a.sent();
          return [2 /*return*/];
      }
    });
  });
}
// async function removeFriend(client: MongoClient,email: string,friendEmail: string){
// }
function main() {
  return __awaiter(this, void 0, void 0, function () {
    var uri, client, statuses, e_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          uri =
            'mongodb+srv://dbUser:dbUserPassword@cluster0.rdokz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
          client = new mongodb_1.MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
          _a.label = 1;
        case 1:
          _a.trys.push([1, 4, 5, 7]);
          // Connect to the MongoDB cluster
          return [4 /*yield*/, client.connect()];
        case 2:
          // Connect to the MongoDB cluster
          _a.sent();
          console.log('connected ');
          return [4 /*yield*/, getAllFriends(client, 'cl@gmail.com')];
        case 3:
          statuses = _a.sent();
          console.log(statuses);
          return [3 /*break*/, 7];
        case 4:
          e_1 = _a.sent();
          console.error(e_1);
          return [3 /*break*/, 7];
        case 5:
          return [4 /*yield*/, client.close()];
        case 6:
          _a.sent();
          return [7 /*endfinally*/];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
main();
