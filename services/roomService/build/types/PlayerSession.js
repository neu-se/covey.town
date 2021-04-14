'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var nanoid_1 = require('nanoid');
var PlayerSession = (function () {
  function PlayerSession(player) {
    this._player = player;
    this._sessionToken = nanoid_1.nanoid();
  }
  Object.defineProperty(PlayerSession.prototype, 'videoToken', {
    get: function () {
      return this._videoToken;
    },
    set: function (value) {
      this._videoToken = value;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(PlayerSession.prototype, 'player', {
    get: function () {
      return this._player;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(PlayerSession.prototype, 'sessionToken', {
    get: function () {
      return this._sessionToken;
    },
    enumerable: false,
    configurable: true,
  });
  return PlayerSession;
})();
exports.default = PlayerSession;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyU2Vzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9QbGF5ZXJTZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQWdDO0FBT2hDO0lBVUUsdUJBQVksTUFBYztRQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUV0QixJQUFJLENBQUMsYUFBYSxHQUFHLGVBQU0sRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxzQkFBSSxxQ0FBVTthQUlkO1lBQ0UsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzFCLENBQUM7YUFORCxVQUFlLEtBQXlCO1lBQ3RDLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQzNCLENBQUM7OztPQUFBO0lBTUQsc0JBQUksaUNBQU07YUFBVjtZQUNFLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN0QixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLHVDQUFZO2FBQWhCO1lBQ0UsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzVCLENBQUM7OztPQUFBO0lBQ0gsb0JBQUM7QUFBRCxDQUFDLEFBL0JELElBK0JDIn0=
