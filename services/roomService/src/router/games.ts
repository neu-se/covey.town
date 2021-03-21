import {Server} from "http";
import { Express } from 'express';
import {townJoinHandler, townSubscriptionHandler} from "../requestHandlers/CoveyTownRequestHandlers";
import {logError} from "../Utils";

export default function addTownRoutes(http: Server, app: Express): void {

  /*
   * Create a new game session (aka two players begin a game)
   */
  app.post('/games', BodyParser.json(), async (req, res) => {
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

  const socketServer = new io.Server(http, { cors: { origin: '*' } });
  socketServer.on('connection', townSubscriptionHandler());
}


