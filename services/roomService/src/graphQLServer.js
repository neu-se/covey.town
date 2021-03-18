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
var express = require('express');
var _a = require('apollo-server-express'),
  ApolloServer = _a.ApolloServer,
  gql = _a.gql;
var app = express();
var cors = require('cors');
var connection = require('./data/Utils/index.ts').connection;
var _b = require('./constants/index.ts'),
  tasks = _b.tasks,
  users = _b.users;
var User = require('./data/Models/users/user.model.server.ts');
app.use(express.json());
app.use(cors());
var typeDefs = require('./typeDefs/index.ts');
/* const resolvers  = require('./resolvers/index.ts')  */
var resolvers = {
  Query: {
    greetings: function () {
      return 'Hello';
    },
    users: function () {
      return users;
    },
    user: function (parent, args) {
      return users.find(function (user) {
        return user.id === args.id;
      });
    },
  },
  Mutation: {
    signUp: function (parent, args) {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, newUser, result, error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              console.log(args.input);
              console.log(args.input.email);
              return [4 /*yield*/, User.findOne({ email: args.input.email })];
            case 1:
              user = _a.sent();
              if (user) {
                throw new Error('User already in use');
              }
              newUser = new User({
                name: args.input.name,
                email: args.input.email,
                password: args.input.password,
              });
              result = newUser.save();
              return [2 /*return*/, result];
            case 2:
              error_1 = _a.sent();
              console.log(error_1);
              throw error_1;
            case 3:
              return [2 /*return*/];
          }
        });
      });
    },
  },
};
var apolloServer = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
});
apolloServer.applyMiddleware({ app: app, path: '/graphql' });
app.use('/', function (req, res, next) {
  res.send({ message: 'Hello' });
});
connection();
app.listen(4000, function () {
  return console.log('Now browse to localhost:4000/graphql');
});
