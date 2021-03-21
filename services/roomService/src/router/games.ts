import {Express} from 'express';
import BodyParser from 'body-parser';
import GameController from "../games/GameController";
import {logError} from "../Utils";
import {StatusCodes} from "http-status-codes";

export default function addTownRoutes(app: Express): void {

  /*
   * Create a new game session (aka two players begin a game)
   */
  app.post('/games', BodyParser.json(), async (req, res) => {
    try {
      const result = await GameController.createGame(
        {
          players: req.body.players,
          gameType: req.body.gameType
        }
      );
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  /*
   * Update a game session after a player makes a move
   */
  app.patch('/games/:gameId', BodyParser.json(), async (req, res) => {
    try {
      const result = GameController.updateGame(
        {gameId: req.body.gameId,
          player: req.body.player,
          move: req.body.move}
      );
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  /*
   * Retrieve data for a game session to populate the view
   */
  app.get('/games/:gameId', BodyParser.json(), async (req, res) => {
    try {
      const result = GameController.findGame(
        {gameId: req.body.gameId}
      );
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });
}
