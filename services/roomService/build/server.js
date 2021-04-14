'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
var express_1 = __importDefault(require('express'));
var http = __importStar(require('http'));
var cors_1 = __importDefault(require('cors'));
var towns_1 = __importDefault(require('./router/towns'));
var CoveyTownsStore_1 = __importDefault(require('./lib/CoveyTownsStore'));
var app = express_1.default();
app.use(cors_1.default());
var server = http.createServer(app);
towns_1.default(server, app);
server.listen(process.env.PORT || 8081, function () {
  var address = server.address();
  console.log('Listening on ' + address.port);
  if (process.env.DEMO_TOWN_ID) {
    var newTown = CoveyTownsStore_1.default
      .getInstance()
      .createTown(process.env.DEMO_TOWN_ID, false);
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvREFBOEI7QUFDOUIseUNBQTZCO0FBQzdCLDhDQUF3QjtBQUV4Qix5REFBMkM7QUFDM0MsMEVBQW9EO0FBRXBELElBQU0sR0FBRyxHQUFHLGlCQUFPLEVBQUUsQ0FBQztBQUN0QixHQUFHLENBQUMsR0FBRyxDQUFDLGNBQUksRUFBRSxDQUFDLENBQUM7QUFDaEIsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUV0QyxlQUFhLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRTNCLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFO0lBQ3RDLElBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQWlCLENBQUM7SUFFaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBZ0IsT0FBTyxDQUFDLElBQU0sQ0FBQyxDQUFDO0lBQzVDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUU7UUFDNUIsSUFBTSxPQUFPLEdBQUcseUJBQWUsQ0FBQyxXQUFXLEVBQUU7YUFDMUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ2hEO0FBQ0gsQ0FBQyxDQUFDLENBQUMifQ==
