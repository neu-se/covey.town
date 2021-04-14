'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var console_1 = require('console');
var nanoid_1 = require('nanoid');
var Player = (function () {
  function Player(userName, isLoggedIn, userId) {
    this.location = {
      x: 0,
      y: 0,
      moving: false,
      rotation: 'front',
    };
    this._userName = userName;
    this._isLoggedIn = isLoggedIn;
    if (isLoggedIn) {
      console_1.assert(userId);
    }
    this._id = isLoggedIn ? userId : nanoid_1.nanoid();
  }
  Object.defineProperty(Player.prototype, 'userName', {
    get: function () {
      return this._userName;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(Player.prototype, 'isLoggedIn', {
    get: function () {
      return this._isLoggedIn;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(Player.prototype, 'id', {
    get: function () {
      return this._id;
    },
    enumerable: false,
    configurable: true,
  });
  Player.prototype.updateLocation = function (location) {
    this.location = location;
  };
  return Player;
})();
exports.default = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3R5cGVzL1BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFpQztBQUNqQyxpQ0FBZ0M7QUFNaEM7SUFhRSxnQkFBWSxRQUFnQixFQUFFLFVBQW1CLEVBQUUsTUFBZTtRQUNoRSxJQUFJLENBQUMsUUFBUSxHQUFHO1lBQ2QsQ0FBQyxFQUFFLENBQUM7WUFDSixDQUFDLEVBQUUsQ0FBQztZQUNKLE1BQU0sRUFBRSxLQUFLO1lBQ2IsUUFBUSxFQUFFLE9BQU87U0FDbEIsQ0FBQztRQUNGLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBRTlCLElBQUksVUFBVSxFQUFFO1lBQ2QsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNoQjtRQUVELElBQUksQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFnQixDQUFDLENBQUMsQ0FBQyxlQUFNLEVBQUUsQ0FBQztJQUN0RCxDQUFDO0lBRUQsc0JBQUksNEJBQVE7YUFBWjtZQUNFLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN4QixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLDhCQUFVO2FBQWQ7WUFDRSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDMUIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSxzQkFBRTthQUFOO1lBQ0UsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ2xCLENBQUM7OztPQUFBO0lBRUQsK0JBQWMsR0FBZCxVQUFlLFFBQXNCO1FBQ25DLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzNCLENBQUM7SUFDSCxhQUFDO0FBQUQsQ0FBQyxBQTdDRCxJQTZDQyJ9
