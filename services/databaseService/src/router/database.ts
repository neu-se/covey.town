import BodyParser from "body-parser";
import { Express } from "express";
import { Server } from "http";
import { StatusCodes } from "http-status-codes";
import io from "socket.io";
import {
  addFriendHandler,
  addUserHandler,
  getAllUsersHandler,
  getFriendsHandler,
  getStatusHandler,
  setStatusHandler,
  userExistsHandler,
} from "../requestHandlers/DBRequestHandlers";
import { logError } from "../Utils";

export default function addDBRoutes(http: Server, app: Express): io.Server {
  app.get("/users/:emailID", BodyParser.json(), async (req, res) => {
    try {
      // const em:string = req.query.email || '';
      // console.log(req.query.email);
      const result = await userExistsHandler({ email: req.params.emailID });
      // const result = "result dummyy";
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message:
          "Internal server error, please see log in server for more details",
      });
    }
  });

  app.get("/users", BodyParser.json(), async (_req, res) => {
    try {
      const result = await getAllUsersHandler();
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message:
          "Internal server error, please see log in server for more details",
      });
    }
  });

  app.get("/users/:emailID/friends", BodyParser.json(), async (req, res) => {
    try {
      const result = await getFriendsHandler({ email: req.params.emailID });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message:
          "Internal server error, please see log in server for more details",
      });
    }
  });

  app.get("/users/:emailID/status", BodyParser.json(), async (req, res) => {
    try {
      const result = await getStatusHandler({ email: req.params.emailID });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message:
          "Internal server error, please see log in server for more details",
      });
    }
  });

  app.post("/users/:emailID/status/", BodyParser.json(), async (req, res) => {
    try {
      const result = await setStatusHandler(req.body.status);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message:
          "Internal server error, please see log in server for more details",
      });
    }
  });

  app.post("/users", BodyParser.json(), async (req, res) => {
    try {
      const result = await addUserHandler(req.body.status);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message:
          "Internal server error, please see log in server for more details",
      });
    }
  });

  app.post(
    "/users/:emailID/friends/:friendEmailID ",
    BodyParser.json(),
    async (req, res) => {
      try {
        const result = await addFriendHandler({
          email: req.params.emailID,
          friendEmail: req.params.friendEmailID,
        });
        res.status(StatusCodes.OK).json(result);
      } catch (err) {
        logError(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message:
            "Internal server error, please see log in server for more details",
        });
      }
    }
  );

  const socketServer = new io.Server(http, { cors: { origin: "*" } });
  return socketServer;
}
