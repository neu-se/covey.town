import CoveyTownsStore from "../lib/CoveyTownsStore";
import Player from "../types/Player";
import assert from "assert";
import {ResponseEnvelope, TownJoinRequest, TownJoinResponse} from "../requestHandlers/CoveyTownRequestHandlers";
import IGame from "./IGame";
import PlayerSession from "../types/PlayerSession";

export default class GameController {
  constructor(game: IGame) {
    this._game = game;
  }

   private _game: IGame;

   get game(){
     return this._game;
   };

   set game(game){
     this._game = game;
   }

  /**
   * Creates a new game session
   *
   * @param list of players (Player objects)
   * @param game type (String)
   */
  createGame(players: Player[], gameType: String): void {}

  /**
   * Updates the game state after a player makes a move
   *
   * @param player who just moved (Player object)
   * @param player move (String)
   */
  updateGame(player: Player, move: String): void {}

  /**
   * Returns the game state to update the view
   *
   * @param gameID (String)
   */
  findGame(gameId: String): void {}

}


//   function createGame(requestData: TownJoinRequest): Promise<ResponseEnvelope<TownJoinResponse>>
// } {
//   const townsStore = CoveyTownsStore.getInstance();
//
//   const coveyTownController = townsStore.getControllerForTown(requestData.coveyTownID);
//   if (!coveyTownController) {
//     return {
//       isOK: false,
//       message: 'Error: No such town',
//     };
//   }
//   const newPlayer = new Player(requestData.userName);
//   const newSession = await coveyTownController.addPlayer(newPlayer);
//   assert(newSession.videoToken);
//   return {
//     isOK: true,
//     response: {
//       coveyUserID: newPlayer.id,
//       coveySessionToken: newSession.sessionToken,
//       providerVideoToken: newSession.videoToken,
//       currentPlayers: coveyTownController.players,
//       friendlyName: coveyTownController.friendlyName,
//       isPubliclyListed: coveyTownController.isPubliclyListed,
//     },
//   };
// }
// }
