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
var body_parser_1 = __importDefault(require('body-parser'));
var socket_io_1 = __importDefault(require('socket.io'));
var http_status_codes_1 = require('http-status-codes');
var CoveyTownRequestHandlers_1 = require('../requestHandlers/CoveyTownRequestHandlers');
var Utils_1 = require('../Utils');
function addTownRoutes(http, app) {
  var _this = this;
  app.post('/sessions', body_parser_1.default.json(), function (req, res) {
    return __awaiter(_this, void 0, void 0, function () {
      var result, err_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4,
              CoveyTownRequestHandlers_1.townJoinHandler({
                userName: req.body.userName,
                coveyTownID: req.body.coveyTownID,
                isLoggedIn: req.body.isLoggedIn,
                userID: req.body.userID,
              }),
            ];
          case 1:
            result = _a.sent();
            res.status(http_status_codes_1.StatusCodes.OK).json(result);
            return [3, 3];
          case 2:
            err_1 = _a.sent();
            Utils_1.logError(err_1);
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
              message: 'Internal server error, please see log in server for more details',
            });
            return [3, 3];
          case 3:
            return [2];
        }
      });
    });
  });
  app.delete('/towns/:townID/:townPassword', body_parser_1.default.json(), function (req, res) {
    return __awaiter(_this, void 0, void 0, function () {
      var result, err_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4,
              CoveyTownRequestHandlers_1.townDeleteHandler({
                coveyTownID: req.params.townID,
                coveyTownPassword: req.params.townPassword,
              }),
            ];
          case 1:
            result = _a.sent();
            res.status(200).json(result);
            return [3, 3];
          case 2:
            err_2 = _a.sent();
            Utils_1.logError(err_2);
            res.status(500).json({
              message: 'Internal server error, please see log in server for details',
            });
            return [3, 3];
          case 3:
            return [2];
        }
      });
    });
  });
  app.get('/towns', body_parser_1.default.json(), function (_req, res) {
    return __awaiter(_this, void 0, void 0, function () {
      var result, err_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4, CoveyTownRequestHandlers_1.townListHandler()];
          case 1:
            result = _a.sent();
            res.status(http_status_codes_1.StatusCodes.OK).json(result);
            return [3, 3];
          case 2:
            err_3 = _a.sent();
            Utils_1.logError(err_3);
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
              message: 'Internal server error, please see log in server for more details',
            });
            return [3, 3];
          case 3:
            return [2];
        }
      });
    });
  });
  app.post('/towns', body_parser_1.default.json(), function (req, res) {
    return __awaiter(_this, void 0, void 0, function () {
      var result, err_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4, CoveyTownRequestHandlers_1.townCreateHandler(req.body)];
          case 1:
            result = _a.sent();
            res.status(http_status_codes_1.StatusCodes.OK).json(result);
            return [3, 3];
          case 2:
            err_4 = _a.sent();
            Utils_1.logError(err_4);
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
              message: 'Internal server error, please see log in server for more details',
            });
            return [3, 3];
          case 3:
            return [2];
        }
      });
    });
  });
  app.patch('/towns/:townID', body_parser_1.default.json(), function (req, res) {
    return __awaiter(_this, void 0, void 0, function () {
      var result, err_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4,
              CoveyTownRequestHandlers_1.townUpdateHandler({
                coveyTownID: req.params.townID,
                isPubliclyListed: req.body.isPubliclyListed,
                friendlyName: req.body.friendlyName,
                coveyTownPassword: req.body.coveyTownPassword,
              }),
            ];
          case 1:
            result = _a.sent();
            res.status(http_status_codes_1.StatusCodes.OK).json(result);
            return [3, 3];
          case 2:
            err_5 = _a.sent();
            Utils_1.logError(err_5);
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
              message: 'Internal server error, please see log in server for more details',
            });
            return [3, 3];
          case 3:
            return [2];
        }
      });
    });
  });
  var socketServer = new socket_io_1.default.Server(http, { cors: { origin: '*' } });
  socketServer.on('connection', CoveyTownRequestHandlers_1.townSubscriptionHandler);
  return socketServer;
}
exports.default = addTownRoutes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG93bnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcm91dGVyL3Rvd25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsNERBQXFDO0FBQ3JDLHdEQUEyQjtBQUUzQix1REFBZ0Q7QUFDaEQsd0ZBTXFEO0FBQ3JELGtDQUFvQztBQUVwQyxTQUF3QixhQUFhLENBQUMsSUFBWSxFQUFFLEdBQVk7SUFBaEUsaUJBcUdDO0lBakdDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsVUFBTyxHQUFHLEVBQUUsR0FBRzs7Ozs7O29CQUVyQyxXQUFNLDBDQUFlLENBQUM7NEJBQ25DLFFBQVEsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVE7NEJBQzNCLFdBQVcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVc7NEJBQ2pDLFVBQVUsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVU7NEJBQy9CLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU07eUJBQ3hCLENBQUMsRUFBQTs7b0JBTEksTUFBTSxHQUFHLFNBS2I7b0JBQ0YsR0FBRyxDQUFDLE1BQU0sQ0FBQywrQkFBVyxDQUFDLEVBQUUsQ0FBQzt5QkFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOzs7O29CQUVoQixnQkFBUSxDQUFDLEtBQUcsQ0FBQyxDQUFDO29CQUNkLEdBQUcsQ0FBQyxNQUFNLENBQUMsK0JBQVcsQ0FBQyxxQkFBcUIsQ0FBQzt5QkFDMUMsSUFBSSxDQUFDO3dCQUNKLE9BQU8sRUFBRSxrRUFBa0U7cUJBQzVFLENBQUMsQ0FBQzs7Ozs7U0FFUixDQUFDLENBQUM7SUFLSCxHQUFHLENBQUMsTUFBTSxDQUFDLDhCQUE4QixFQUFFLHFCQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsVUFBTyxHQUFHLEVBQUUs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
