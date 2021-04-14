'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
var CoveyTownController_1 = __importDefault(require('./CoveyTownController'));
function passwordMatches(provided, expected) {
  if (provided === expected) {
    return true;
  }
  if (process.env.MASTER_TOWN_PASSWORD && process.env.MASTER_TOWN_PASWORD === provided) {
    return true;
  }
  return false;
}
var CoveyTownsStore = (function () {
  function CoveyTownsStore() {
    this._towns = [];
  }
  CoveyTownsStore.getInstance = function () {
    if (CoveyTownsStore._instance === undefined) {
      CoveyTownsStore._instance = new CoveyTownsStore();
    }
    return CoveyTownsStore._instance;
  };
  CoveyTownsStore.prototype.getControllerForTown = function (coveyTownID) {
    return this._towns.find(function (town) {
      return town.coveyTownID === coveyTownID;
    });
  };
  CoveyTownsStore.prototype.getTowns = function () {
    return this._towns
      .filter(function (townController) {
        return townController.isPubliclyListed;
      })
      .map(function (townController) {
        return {
          coveyTownID: townController.coveyTownID,
          friendlyName: townController.friendlyName,
          currentOccupancy: townController.occupancy,
          maximumOccupancy: townController.capacity,
        };
      });
  };
  CoveyTownsStore.prototype.createTown = function (friendlyName, isPubliclyListed) {
    var newTown = new CoveyTownController_1.default(friendlyName, isPubliclyListed);
    this._towns.push(newTown);
    return newTown;
  };
  CoveyTownsStore.prototype.updateTown = function (
    coveyTownID,
    coveyTownPassword,
    friendlyName,
    makePublic,
  ) {
    var existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      if (friendlyName !== undefined) {
        if (friendlyName.length === 0) {
          return false;
        }
        existingTown.friendlyName = friendlyName;
      }
      if (makePublic !== undefined) {
        existingTown.isPubliclyListed = makePublic;
      }
      return true;
    }
    return false;
  };
  CoveyTownsStore.prototype.deleteTown = function (coveyTownID, coveyTownPassword) {
    var existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      this._towns = this._towns.filter(function (town) {
        return town !== existingTown;
      });
      existingTown.disconnectAllPlayers();
      return true;
    }
    return false;
  };
  return CoveyTownsStore;
})();
exports.default = CoveyTownsStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ292ZXlUb3duc1N0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9Db3ZleVRvd25zU3RvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw4RUFBd0Q7QUFHeEQsU0FBUyxlQUFlLENBQUMsUUFBZ0IsRUFBRSxRQUFnQjtJQUN6RCxJQUFJLFFBQVEsS0FBSyxRQUFRLEVBQUU7UUFDekIsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUNELElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixLQUFLLFFBQVEsRUFBRTtRQUNwRixPQUFPLElBQUksQ0FBQztLQUNiO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQ7SUFBQTtRQUdVLFdBQU0sR0FBMEIsRUFBRSxDQUFDO0lBd0Q3QyxDQUFDO0lBdERRLDJCQUFXLEdBQWxCO1FBQ0UsSUFBSSxlQUFlLENBQUMsU0FBUyxLQUFLLFNBQVMsRUFBRTtZQUMzQyxlQUFlLENBQUMsU0FBUyxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7U0FDbkQ7UUFDRCxPQUFPLGVBQWUsQ0FBQyxTQUFTLENBQUM7SUFDbkMsQ0FBQztJQUVELDhDQUFvQixHQUFwQixVQUFxQixXQUFtQjtRQUN0QyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxDQUFDLFdBQVcsS0FBSyxXQUFXLEVBQWhDLENBQWdDLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQsa0NBQVEsR0FBUjtRQUNFLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBQSxjQUFjLElBQUksT0FBQSxjQUFjLENBQUMsZ0JBQWdCLEVBQS9CLENBQStCLENBQUM7YUFDekUsR0FBRyxDQUFDLFVBQUEsY0FBYyxJQUFJLE9BQUEsQ0FBQztZQUN0QixXQUFXLEVBQUUsY0FBYyxDQUFDLFdBQVc7WUFDdkMsWUFBWSxFQUFFLGNBQWMsQ0FBQyxZQUFZO1lBQ3pDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxTQUFTO1lBQzFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxRQUFRO1NBQzFDLENBQUMsRUFMcUIsQ0FLckIsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztJQUVELG9DQUFVLEdBQVYsVUFBVyxZQUFvQixFQUFFLGdCQUF5QjtRQUN4RCxJQUFNLE9BQU8sR0FBRyxJQUFJLDZCQUFtQixDQUFDLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3hFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFCLE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxvQ0FBVSxHQUFWLFVBQVcsV0FBbUIsRUFBRSxpQkFBeUIsRUFBRSxZQUFxQixFQUFFLFVBQW9CO1FBQ3BHLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1RCxJQUFJLFlBQVksSUFBSSxlQUFlLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxDQUFDLGtCQUFrQixDQUFDLEVBQUU7WUFDdkYsSUFBSSxZQUFZLEtBQUssU0FBUyxFQUFFO2dCQUM5QixJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUM3QixPQUFPLEtBQUssQ0FBQztpQkFDZDtnQkFDRCxZQUFZLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQzthQUMxQztZQUNELElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtnQkFDNUIsWUFBWSxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQzthQUM1QztZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxvQ0FBVSxHQUFWLFVBQVcsV0FBbUIsRUFBRSxpQkFBeUI7UUFDdkQsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVELElBQUksWUFBWSxJQUFJLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxZQUFZLENBQUMsa0JBQWtCLENBQUMsRUFBRTtZQUN2RixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxLQUFLLFlBQVksRUFBckIsQ0FBcUIsQ0FBQyxDQUFDO1lBQ2hFLFlBQVksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQ3BDLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFSCxzQkFBQztBQUFELENBQUMsQUEzREQsSUEyREMifQ==
