import { Express } from 'express';
import BodyParser from 'body-parser';
import io from 'socket.io';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import {
  leaderboardHandler,
  updateLeaderboardHandler,
  townCreateHandler, townDeleteHandler,
  townJoinHandler,
  townListHandler,
  townSubscriptionHandler,
  townUpdateHandler,
  startGameHandler,
  isgameActiveHandler,
  currentPlayerHandler,
  getWinnerHandler,
  getBoardHandler,
  makeMoveHandler,
  endGameHandler
} from '../requestHandlers/CoveyTownRequestHandlers';
import { logError } from '../Utils';

export default function addTownRoutes(http: Server, app: Express): io.Server {
  /*
   * Create a new session (aka join a town)
   */
  app.post('/sessions', BodyParser.json(), async (req, res) => {
    try {
      const result = await townJoinHandler({
        userName: req.body.userName,
        coveyTownID: req.body.coveyTownID,
      });
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

  /**
   * Delete a town
   */
  app.delete('/towns/:townID/:townPassword', BodyParser.json(), async (req, res) => {
    try {
      const result = await townDeleteHandler({
        coveyTownID: req.params.townID,
        coveyTownPassword: req.params.townPassword,
      });
      res.status(200)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(500)
        .json({
          message: 'Internal server error, please see log in server for details',
        });
    }
  });

  /**
   * List all towns
   */
  app.get('/towns', BodyParser.json(), async (_req, res) => {
    try {
      const result = await townListHandler();
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

  /**
   * Create a town
   */
  app.post('/towns', BodyParser.json(), async (req, res) => {
    try {
      const result = await townCreateHandler(req.body);
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

  /**
   * Update a town
   */
  app.patch('/towns/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await townUpdateHandler({
        coveyTownID: req.params.townID,
        isPubliclyListed: req.body.isPubliclyListed,
        friendlyName: req.body.friendlyName,
        coveyTownPassword: req.body.coveyTownPassword,
      });
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

  /**
   * Get the leaderboard of a town
   */
  app.get('/leaderboard/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await leaderboardHandler({
        coveyTownID: req.params.townID,
      });
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

  /**
   * Update the leaderboard of a town
   */
   app.patch('/leaderboard/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await updateLeaderboardHandler({
        coveyTownID: req.params.townID,
        userName: req.body.userName,
        points: req.body.points,
      });
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

  /**
    Start the tictactoe game for a town
  **/
  app.post('/tictactoe/:townID/:playerID', BodyParser.json(), async (req, res) => {
    try {
      const result = await startGameHandler({
        coveyTownID: req.params.townID,
        playerID:req.params.playerID,

      });
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

  /**
    is tictactoe game active for a town
  **/
  app.get('/tictactoeActive/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await isgameActiveHandler({
        coveyTownID: req.params.townID,
      });
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

  /**
    Who's turn is it for this town's tictactoe game
  **/
  app.get('/tictactoe/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await currentPlayerHandler({
        coveyTownID: req.params.townID,
      });
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

  /**
    Who was the winner of the last game
  **/
  app.get('/tictactoeWinner/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await getWinnerHandler({
        coveyTownID: req.params.townID,
      });
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

  /**
    Get current board for town's tictactoe
  **/
  app.get('/tictactoeBoard/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await getBoardHandler({
        coveyTownID: req.params.townID,
      });
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


  /**
    Make a move on a town's tictactoe
  **/
  app.post('/tictactoe/:townID, player, x, y', BodyParser.json(), async (req, res) => {
    try {
      const result = await makeMoveHandler({
        coveyTownID: req.params.townID,
        player: req.params.player,
        x: req.params.x,
        y: req.params.y,
      });
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


  /**
    End a town's tictactoe
  **/
  app.delete('/tictactoe/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await endGameHandler({
        coveyTownID: req.params.townID,
      });
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




  const socketServer = new io.Server(http, { cors: { origin: '*' } });
  socketServer.on('connection', townSubscriptionHandler);
  return socketServer;

  /**
  const tttSocketServer = new io.Server(http, { cors: { origin: '*' } });
  socketServer.on('connection', tttSubscriptionHandler);
  return socketServer;
  **/
}
