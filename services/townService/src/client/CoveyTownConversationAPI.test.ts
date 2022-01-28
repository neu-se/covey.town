import CORS from 'cors';
import { randomInt } from 'crypto';
import Express from 'express';
import http from 'http';
import { mock, mockReset, mockDeep } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { AddressInfo } from 'net';
import CoveyTownController from '../lib/CoveyTownController';
import CoveyTownsStore from '../lib/CoveyTownsStore';
import * as requestHandlers from '../requestHandlers/CoveyTownRequestHandlers';
import { TownJoinResponse } from '../requestHandlers/CoveyTownRequestHandlers';
import addTownRoutes from '../router/towns';
import Player from '../types/Player';
import PlayerSession from '../types/PlayerSession';
import * as utils from '../Utils';
import { createConversationForTesting } from './TestUtils';
import TownsServiceClient, { ResponseEnvelope, ServerConversationArea } from './TownsServiceClient';

type TestTownData = {
  friendlyName: string;
  coveyTownID: string;
  isPubliclyListed: boolean;
  townUpdatePassword: string;
};

describe('Create Conversation Area API', () => {
  describe('REST API', () => {
    let server: http.Server;
    let apiClient: TownsServiceClient;

    async function createTownForTesting(
      friendlyNameToUse?: string,
      isPublic = false,
    ): Promise<TestTownData> {
      const friendlyName =
        friendlyNameToUse !== undefined
          ? friendlyNameToUse
          : `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
      const ret = await apiClient.createTown({
        friendlyName,
        isPubliclyListed: isPublic,
      });
      return {
        friendlyName,
        isPubliclyListed: isPublic,
        coveyTownID: ret.coveyTownID,
        townUpdatePassword: ret.coveyTownPassword,
      };
    }

    beforeAll(async () => {
      const app = Express();
      app.use(CORS());
      server = http.createServer(app);

      addTownRoutes(server, app);
      await server.listen();
      const address = server.address() as AddressInfo;

      apiClient = new TownsServiceClient(`http://127.0.0.1:${address.port}`);
    });
    afterAll(async () => {
      await server.close();
    });
    it('Executes without error when creating a new conversation [T1.1]', async () => {
      const testingTown = await createTownForTesting(undefined, true);
      const testingSession = await apiClient.joinTown({
        userName: nanoid(),
        coveyTownID: testingTown.coveyTownID,
      });
      await apiClient.createConversationArea({
        conversationArea: createConversationForTesting(),
        coveyTownID: testingTown.coveyTownID,
        sessionToken: testingSession.coveySessionToken,
      });
    });
    describe('with a failure in request handler', () => {
      let spy : jest.SpyInstance;
      let errorSpy: jest.SpyInstance;
      const errorMessage = nanoid();
      beforeAll(() => {
        spy = jest
          .spyOn(requestHandlers, 'conversationAreaCreateHandler')
          .mockImplementation(() => {
            throw new Error(errorMessage);
          });
        errorSpy = jest.spyOn(utils, 'logError').mockImplementation(() => {});
      });
      afterAll(() => {
        spy?.mockRestore();
        errorSpy?.mockRestore();
      });
      it('Returns an error code 500 if error occurs [T1.1]', async () => {
        const testingTown = await createTownForTesting(undefined, true);
        const testingSession = await apiClient.joinTown({
          userName: nanoid(),
          coveyTownID: testingTown.coveyTownID,
        });

        try {
          await apiClient.createConversationArea({
            conversationArea: createConversationForTesting(),
            coveyTownID: testingTown.coveyTownID,
            sessionToken: testingSession.coveySessionToken,
          });
          fail('Expected an error to be thrown by the client');
        } catch (err) {
          expect((err as Error).toString()).toEqual('Error: Request failed with status code 500');
        }
      });
      it('Logs errors that occur during invocation of the request handler [T1.1]', async () => {
        const testingTown = await createTownForTesting(undefined, true);
        const testingSession = await apiClient.joinTown({
          userName: nanoid(),
          coveyTownID: testingTown.coveyTownID,
        });

        errorSpy.mockClear();
        try {
          await apiClient.createConversationArea({
            conversationArea: createConversationForTesting(),
            coveyTownID: testingTown.coveyTownID,
            sessionToken: testingSession.coveySessionToken,
          });
        } catch (err) {
          // expected
        }
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy.mock.calls[0][0].toString()).toEqual(`Error: ${  errorMessage}`);
      });
    });
    it('Includes newly created conversations when a new player joins [T1.3]', async () => {
      const testingTown = await createTownForTesting(undefined, true);
      const testingSession = await apiClient.joinTown({
        userName: nanoid(),
        coveyTownID: testingTown.coveyTownID,
      });
      const convArea = createConversationForTesting();
      await apiClient.createConversationArea({
        conversationArea: convArea,
        coveyTownID: testingTown.coveyTownID,
        sessionToken: testingSession.coveySessionToken,
      });
      const { conversationAreas } = await apiClient.joinTown({
        userName: nanoid(),
        coveyTownID: testingTown.coveyTownID,
      });
      expect(conversationAreas.length).toBe(1);
      expect(conversationAreas[0].label).toEqual(convArea.label);
      expect(conversationAreas[0].topic).toEqual(convArea.topic);
      expect(conversationAreas[0].boundingBox).toEqual(convArea.boundingBox);
      expect(conversationAreas[0].occupantsByID.length).toBe(0);
    });
  });
  function generateConversationArea(): ServerConversationArea {
    return {
      label: nanoid(),
      boundingBox: {
        height: randomInt(1000),
        width: randomInt(1000),
        x: randomInt(100),
        y: randomInt(1000),
      },
      occupantsByID: [],
      topic: nanoid(),
    };
  }
  describe('conversationAreaCreateHandler', () => {

    const spys: jest.SpyInstance[] = [];
    const mockCoveyTownStore = mock<CoveyTownsStore>();
    const mockCoveyTownController = mock<CoveyTownController>();
    beforeAll(() => {
      spys.push(jest.spyOn(CoveyTownsStore, 'getInstance').mockReturnValue(mockCoveyTownStore));
    });
    beforeEach(() => {
      mockReset(mockCoveyTownController);
      mockReset(mockCoveyTownStore);
      mockCoveyTownStore.getControllerForTown.mockReturnValue(mockCoveyTownController);
    });

    describe('On a request where a conversation exists with this name', () => {
      let coveyTownID : string;
      let conversationArea : ServerConversationArea;
      let response: ResponseEnvelope<Record<string, null>>;
      let playerSession: PlayerSession;
      beforeEach(() => {
        coveyTownID = nanoid();
        conversationArea = generateConversationArea();
        playerSession = new PlayerSession(new Player(nanoid()));
        mockCoveyTownController.getSessionByToken.mockReturnValue(playerSession);
        mockCoveyTownController.addConversationArea.mockReturnValue(false);
        response = requestHandlers.conversationAreaCreateHandler({
          conversationArea,
          coveyTownID,
          sessionToken: playerSession.sessionToken,
        });
        expect(mockCoveyTownController.getSessionByToken).toHaveBeenCalledTimes(1);
        expect(mockCoveyTownController.addConversationArea).toHaveBeenCalled();
      });

      it('Returns the correct error message [T1.2b]', () => {
        expect(response.isOK).toBe(false);
        expect(response.response).toEqual({});
        expect(response.message).toEqual(`Unable to create conversation ${conversationArea.label} with topic ${conversationArea.topic}`);
      });
    });
    describe('On a request with an invalid coveyTownID', () => {
      let coveyTownID : string;
      let conversationArea : ServerConversationArea;
      let response: ResponseEnvelope<Record<string, null>>;
      let playerSession: PlayerSession;
      beforeEach(() => {
        mockCoveyTownStore.getControllerForTown.mockReturnValue(undefined);
        coveyTownID = nanoid();
        conversationArea = generateConversationArea();
        playerSession = new PlayerSession(new Player(nanoid()));
        response = requestHandlers.conversationAreaCreateHandler({
          conversationArea,
          coveyTownID,
          sessionToken: playerSession.sessionToken,
        });
        expect(mockCoveyTownController.getSessionByToken).not.toHaveBeenCalled();
        expect(mockCoveyTownController.addConversationArea).not.toHaveBeenCalled();
      });

      it('Returns the correct error message [T1.2b]', () => {
        expect(response.isOK).toBe(false);
        expect(response.response).toEqual({});
        expect(response.message).toEqual('Not authorized');
      });
    });
    describe('On a successful request', () => {
      let coveyTownID: string;
      let conversationArea: ServerConversationArea;
      let response : ResponseEnvelope<Record<string, null>>;
      let playerSession : PlayerSession;
      beforeEach(() => {
        coveyTownID = nanoid();
        conversationArea = generateConversationArea();
        playerSession = new PlayerSession(new Player(nanoid()));
        mockCoveyTownController.getSessionByToken.mockReturnValue(playerSession);
        mockCoveyTownController.addConversationArea.mockReturnValue(true);
        response = requestHandlers.conversationAreaCreateHandler({
          conversationArea,
          coveyTownID,
          sessionToken: playerSession.sessionToken,
        });
        expect(mockCoveyTownController.getSessionByToken).toHaveBeenCalledTimes(1);
        expect(mockCoveyTownController.addConversationArea).toHaveBeenCalled();
      });

      it('Provides exactly the correct response and message upon success [T1.2b]', () => {
        expect(response.isOK).toBe(true);
        expect(response.response).toEqual({});
        expect(response.message).toBeUndefined();
      });
      it('Passes the correct conversation area to addController [T1.2b]', () => {
        expect(mockCoveyTownController.addConversationArea).toHaveBeenCalledWith(conversationArea);
      });

      it('Invokes addConversationArea on the correct town controller [T1.2b]', () => {
        expect(mockCoveyTownStore.getControllerForTown).toHaveBeenCalledWith(coveyTownID);
      });
    });
    it('Checks for a valid session token before creating a conversation [T1.2b]', () => {
      const coveyTownID = nanoid();
      const conversationArea = generateConversationArea();
      const response = requestHandlers.conversationAreaCreateHandler({
        conversationArea,
        coveyTownID,
        sessionToken: nanoid(),
      });
      expect(response.isOK).toBe(false);
      expect(response.response).toEqual({});
      expect(response.message).toEqual('Not authorized');
      expect(mockCoveyTownController.getSessionByToken).toHaveBeenCalledTimes(1);
      expect(mockCoveyTownController.addConversationArea).not.toHaveBeenCalled();
    });
  });
  describe('townJoinHandler', () => {
    const spys: jest.SpyInstance[] = [];
    const mockCoveyTownStore = mock<CoveyTownsStore>();
    const mockCoveyTownController = mockDeep<CoveyTownController>();
    beforeAll(() => {
      spys.push(jest.spyOn(CoveyTownsStore, 'getInstance').mockReturnValue(mockCoveyTownStore));
    });
    let coveyTownID : string;
    let userName : string;
    let player : Player;
    let playerSession : PlayerSession;
    let response : ResponseEnvelope<TownJoinResponse>;
    const friendlyName = nanoid();
    const isPubliclyListed = true;
    let conversationAreas : ServerConversationArea[];
    beforeEach(async () => {
      mockReset(mockCoveyTownController);
      mockReset(mockCoveyTownStore);
      mockCoveyTownStore.getControllerForTown.mockReturnValue(mockCoveyTownController);
      coveyTownID = nanoid();
      userName = nanoid();
      player = new Player(userName);
      playerSession = new PlayerSession(player);
      playerSession.videoToken = nanoid();
      mockCoveyTownController.friendlyName = friendlyName;
      mockCoveyTownController.isPubliclyListed = isPubliclyListed;
      conversationAreas = [generateConversationArea(), generateConversationArea()];
      // eslint-disable-next-line
      ((mockCoveyTownController as any))._conversationAreas = conversationAreas;
      mockCoveyTownController.addPlayer.mockResolvedValue(playerSession);
      response = await requestHandlers.townJoinHandler({ coveyTownID, userName });
    });
    it('Should behave normally and return exactly the set of conversations in the town controller when a player joins [T1.3]', async () => {
      expect(mockCoveyTownStore.getControllerForTown).toHaveBeenCalledWith(coveyTownID);
      expect(mockCoveyTownController.addPlayer).toHaveBeenCalledTimes(1);
      expect(response.isOK).toBe(true);
      expect(response.response?.coveyUserID).toBe(mockCoveyTownController.addPlayer.mock.calls[0][0].id);
      expect(response.response?.coveySessionToken).toBe(playerSession.sessionToken);
      expect(response.response?.providerVideoToken).toBe(playerSession.videoToken);
      expect(response.response?.currentPlayers).toBe(mockCoveyTownController.players);
      expect(response.response?.friendlyName).toBe(friendlyName);
      expect(response.response?.isPubliclyListed).toBe(isPubliclyListed);

      expect(response.response?.conversationAreas).toBe(mockCoveyTownController.conversationAreas);
    });
  });
});
