import assert from 'assert';
import EventEmitter from 'events';
import _ from 'lodash';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import TypedEmitter from 'typed-emitter';
import Interactable from '../components/Town/Interactable';
import ConversationArea from '../components/Town/interactables/ConversationArea';
import GameArea from '../components/Town/interactables/GameArea';
import ViewingArea from '../components/Town/interactables/ViewingArea';
import { LoginController } from '../contexts/LoginControllerContext';
import { TownsService, TownsServiceClient } from '../generated/client';
import useTownController from '../hooks/useTownController';
import {
  ChatMessage,
  CoveyTownSocket,
  GameState,
  Interactable as InteractableAreaModel,
  InteractableCommand,
  InteractableCommandBase,
  InteractableCommandResponse,
  InteractableID,
  PlayerID,
  PlayerLocation,
  TownSettingsUpdate,
  ViewingArea as ViewingAreaModel,
} from '../types/CoveyTownSocket';
import { isConversationArea, isTicTacToeArea, isViewingArea } from '../types/TypeUtils';
import ConversationAreaController from './interactable/ConversationAreaController';
import GameAreaController, { GameEventTypes } from './interactable/GameAreaController';
import InteractableAreaController, {
  BaseInteractableEventMap,
} from './interactable/InteractableAreaController';
import TicTacToeAreaController from './interactable/TicTacToeAreaController';
import ViewingAreaController from './interactable/ViewingAreaController';
import PlayerController from './PlayerController';

const CALCULATE_NEARBY_PLAYERS_DELAY_MS = 300;
const SOCKET_COMMAND_TIMEOUT_MS = 5000;

export type ConnectionProperties = {
  userName: string;
  townID: string;
  loginController: LoginController;
};

/**
 * The TownController emits these events. Components may subscribe to these events
 * by calling the `addListener` method on a TownController
 */
export type TownEvents = {
  /**
   * An event that indicates that the TownController is now connected to the townService
   * @param providerVideoToken a secret token that can be used to connect to the video service
   */
  connect: (providerVideoToken: string) => void;
  /**
   * An event that indicates that the TownController has been disconnected from the townService
   */
  disconnect: () => void;
  /**
   * An event that indicates that the town settings have been updated. This event is dispatched
   * before updating the properties of this TownController; clients may find the new settings in the parameter
   */
  townSettingsUpdated: (newTownSettings: TownSettingsUpdate) => void;
  /**
   * An event that indicates that the set of players in the town has changed. This event is dispatched
   * before updating the proeprties of this TownController; clients will find the new players in the parameter
   */
  playersChanged: (newPlayers: PlayerController[]) => void;
  /**
   * An event that indicates that a player has moved. This event is dispatched after updating the player's location -
   * the new location can be found on the PlayerController.
   */
  playerMoved: (movedPlayer: PlayerController) => void;

  /**
   * An event that indicates that the set of active interactable areas has changed. This event is dispatched
   * after updating the set of interactable areas - the new set of interactable areas can be found on the TownController.
   */
  interactableAreasChanged: () => void;

  /**
   * An event that indicates that a new chat message has been received, which is the parameter passed to the listener
   */
  chatMessage: (message: ChatMessage) => void;
  /**
   * An event that indicates that the 2D game is now paused. Pausing the game should, if nothing else,
   * release all key listeners, so that text entry is possible
   */
  pause: () => void;
  /**
   * An event that indicates that the 2D game should now be unpaused (resumed).
   */
  unPause: () => void;
  /**
   * An event that indicates that the player is now interacting with a different interactable
   * @param typeName the type of interactable
   * @param obj the interactable that is being interacted with
   */
  interact: <T extends Interactable>(typeName: T['name'], obj: T) => void;
};

/**
 * The (frontend) TownController manages the communication between the frontend
 * and the backend. When a player join a town, a new TownController is created,
 * and frontend components can register to receive events (@see CoveyTownEvents).
 *
 * To access the TownController from a React component, use the
 * useTownController hook (@see useTownController). While the town controller
 * can be directly used by React components, it is generally preferable to use the various hooks
 * defined in this file (e.g. @see usePlayers, @see useConversationAreas), which will automatically
 * subscribe to updates to their respective data, triggering the React component that consumes them
 * to re-render when the underlying data changes.
 *
 */
export default class TownController extends (EventEmitter as new () => TypedEmitter<TownEvents>) {
  /** The socket connection to the townsService. Messages emitted here
   * are received by the TownController in that service.
   */
  private _socket: CoveyTownSocket;

  /**
   * The REST API client to access the townsService
   */
  private _townsService: TownsService;

  /**
   * The login controller is used by the frontend application to manage logging in to a town,
   * and is also used to log out of a town.
   */
  private _loginController: LoginController;

  /**
   * The current list of players in the town. Adding or removing players might replace the array
   * with a new one; clients should take note not to retain stale references.
   */
  private _playersInternal: PlayerController[] = [];

  /**
   * The current list of interactable areas in the town. Adding or removing interactable areas might replace the array.
   */
  private _interactableControllers: InteractableAreaController<
    BaseInteractableEventMap,
    InteractableAreaModel
  >[] = [];

  /**
   * The friendly name of the current town, set only once this TownController is connected to the townsService
   */
  private _friendlyNameInternal?: string;

  /**
   * The town ID of the current town, generated by the backend townsService and used to uniquely identify this town with the
   * server and other players
   */
  private readonly _townID: string;

  /**
   * If true, then this town's friendlyName and townID are included in the public listing of active towns.
   * Changes to this variable do not influence the behavior of the server, it must be changed through the townsService API client
   */
  private _townIsPubliclyListedInternal = false;

  /**
   * The username of the player whose browser created this TownController
   */
  private readonly _userName: string;

  /**
   * The user ID of the player whose browser created this TownController. The user ID is set by the backend townsService, and
   * is only available after the service is connected.
   */
  private _userID?: string;

  /**
   * A reference to the Player object that represents the player whose browser created this TownController.
   */
  private _ourPlayer?: PlayerController;

  /**
   * A secret token that is provided by the townsService when we connect, and is needed
   * for authenticating future API calls as being from the same user who created this TownController.
   */
  private _sessionToken?: string;

  /**
   * A secret token that is provided by the townsService when we connect, and can be used to connect
   * to a third-party video conferecing service.
   */
  private _providerVideoToken?: string;

  /**
   * A flag indicating whether the current 2D game is paused, or not. Pausing the game will prevent it from updating,
   * and will also release any key bindings, allowing all keys to be used for text entry or other purposes.
   */
  private _paused = false;

  /**
   * An event emitter that broadcasts interactable-specific events
   */
  private _interactableEmitter = new EventEmitter();

  public constructor({ userName, townID, loginController }: ConnectionProperties) {
    super();
    this._townID = townID;
    this._userName = userName;
    this._loginController = loginController;

    /*
        The event emitter will show a warning if more than this number of listeners are registered, as it
        may indicate a leak (listeners that should de-register not de-registering). The default is 10; we expect
        more than 10 listeners because each conversation area might be its own listener, and there are more than 10
        */
    this.setMaxListeners(30);

    const url = process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL;
    assert(url);
    this._socket = io(url, { auth: { userName, townID } });
    this._townsService = new TownsServiceClient({ BASE: url }).towns;
    this.registerSocketListeners();
  }

  public get sessionToken() {
    return this._sessionToken || '';
  }

  public get userID() {
    const id = this._userID;
    assert(id);
    return id;
  }

  public get townIsPubliclyListed() {
    return this._townIsPubliclyListedInternal;
  }

  private set _townIsPubliclyListed(newSetting: boolean) {
    this._townIsPubliclyListedInternal = newSetting;
    this.emit('townSettingsUpdated', { isPubliclyListed: newSetting });
  }

  public get providerVideoToken() {
    const token = this._providerVideoToken;
    assert(token);
    return token;
  }

  public get userName() {
    return this._userName;
  }

  public get friendlyName() {
    const friendlyName = this._friendlyNameInternal;
    assert(friendlyName);
    return friendlyName;
  }

  private set _friendlyName(newFriendlyName: string) {
    this._friendlyNameInternal = newFriendlyName;
    this.emit('townSettingsUpdated', { friendlyName: newFriendlyName });
  }

  public get paused() {
    return this._paused;
  }

  public get ourPlayer() {
    const ret = this._ourPlayer;
    assert(ret);
    return ret;
  }

  public get townID() {
    return this._townID;
  }

  public pause(): void {
    if (!this._paused) {
      this._paused = true;
      this.emit('pause');
    }
  }

  public unPause(): void {
    if (this._paused) {
      this._paused = false;
      this.emit('unPause');
    }
  }

  public get players(): PlayerController[] {
    return this._playersInternal;
  }

  private set _players(newPlayers: PlayerController[]) {
    this.emit('playersChanged', newPlayers);
    this._playersInternal = newPlayers;
  }

  public getPlayer(id: PlayerID) {
    const ret = this._playersInternal.find(eachPlayer => eachPlayer.id === id);
    assert(ret);
    return ret;
  }

  public get conversationAreas(): ConversationAreaController[] {
    const ret = this._interactableControllers.filter(
      eachInteractable => eachInteractable instanceof ConversationAreaController,
    );
    return ret as ConversationAreaController[];
  }

  public get interactableEmitter() {
    return this._interactableEmitter;
  }

  public get viewingAreas() {
    const ret = this._interactableControllers.filter(
      eachInteractable => eachInteractable instanceof ViewingAreaController,
    );
    return ret as ViewingAreaController[];
  }

  public get gameAreas() {
    const ret = this._interactableControllers.filter(
      eachInteractable => eachInteractable instanceof GameAreaController,
    );
    return ret as GameAreaController<GameState, GameEventTypes>[];
  }

  /**
   * Begin interacting with an interactable object. Emits an event to all listeners.
   * @param interactedObj
   */
  public interact<T extends Interactable>(interactedObj: T) {
    this._interactableEmitter.emit(interactedObj.getType(), interactedObj);
  }

  /**
   * End interacting with an interactable object. Emits an event to all listeners.
   * @param objectNoLongerInteracting
   */
  public interactEnd(objectNoLongerInteracting: Interactable) {
    this._interactableEmitter.emit('endInteraction', objectNoLongerInteracting);
  }

  /**
   * Registers listeners for the events that can come from the server to our socket
   */
  registerSocketListeners() {
    /**
     * On chat messages, forward the messages to listeners who subscribe to the controller's events
     */
    this._socket.on('chatMessage', message => {
      this.emit('chatMessage', message);
    });
    /**
     * On changes to town settings, update the local state and emit a townSettingsUpdated event to
     * the controller's event listeners
     */
    this._socket.on('townSettingsUpdated', update => {
      const newFriendlyName = update.friendlyName;
      if (newFriendlyName !== undefined) {
        this._friendlyName = newFriendlyName;
      }
      if (update.isPubliclyListed !== undefined) {
        this._townIsPubliclyListed = update.isPubliclyListed;
      }
    });
    /**
     * On town closing events, emit a disconnect message to the controller's event listeners, and
     * return to the login screen
     */
    this._socket.on('townClosing', () => {
      this.emit('disconnect');
      this._loginController.setTownController(null);
    });
    /**
     * When a new player joins the town, update our local state of players in the town and notify
     * the controller's event listeners that the player has moved to their starting location.
     *
     * Note that setting the players array will also emit an event that the players in the town have changed.
     */
    this._socket.on('playerJoined', newPlayer => {
      const newPlayerObj = PlayerController.fromPlayerModel(newPlayer);
      this._players = this.players.concat([newPlayerObj]);
      this.emit('playerMoved', newPlayerObj);
    });
    /**
     * When a player disconnects from the town, update local state
     *
     * Note that setting the players array will also emit an event that the players in the town have changed.
     */
    this._socket.on('playerDisconnect', disconnectedPlayer => {
      this._players = this.players.filter(eachPlayer => eachPlayer.id !== disconnectedPlayer.id);
    });
    /**
     * When a player moves, update local state and emit an event to the controller's event listeners
     */
    this._socket.on('playerMoved', movedPlayer => {
      const playerToUpdate = this.players.find(eachPlayer => eachPlayer.id === movedPlayer.id);
      if (playerToUpdate) {
        if (playerToUpdate === this._ourPlayer) {
          /*
           * If we are told that WE moved, we shouldn't update our x,y because it's probably lagging behind
           * real time. However: we SHOULD update our interactable ID, because its value is managed by the server
           */
          playerToUpdate.location.interactableID = movedPlayer.location.interactableID;
        } else {
          playerToUpdate.location = movedPlayer.location;
        }
        this.emit('playerMoved', playerToUpdate);
      }
    });

    /**
     * When an interactable's state changes, push that update into the relevant controller
     *
     * If an interactable area transitions from active to inactive (or inactive to active), this handler will emit
     * an interactableAreasChanged event to listeners of this TownController.
     *
     * If the update changes properties of the interactable, the interactable is also expected to emit its own
     * events.
     */
    this._socket.on('interactableUpdate', interactable => {
      try {
        const controller = this._interactableControllers.find(c => c.id === interactable.id);
        if (controller) {
          const activeBefore = controller.isActive();
          controller.updateFrom(interactable, this._playersByIDs(interactable.occupants));
          const activeNow = controller.isActive();
          if (activeBefore !== activeNow) {
            this.emit('interactableAreasChanged');
          }
        }
      } catch (err) {
        console.error('Error updating interactable', interactable);
        console.trace(err);
      }
    });
  }

  /**
   * Emit a movement event for the current player, updating the state locally and
   * also notifying the townService that our player moved.
   *
   * Note: it is the responsibility of the townService to set the 'interactableID' parameter
   * of the player's location, and any interactableID set here may be overwritten by the townService
   *
   * @param newLocation
   */
  public emitMovement(newLocation: PlayerLocation) {
    this._socket.emit('playerMovement', newLocation);
    const ourPlayer = this._ourPlayer;
    assert(ourPlayer);
    ourPlayer.location = newLocation;
    this.emit('playerMoved', ourPlayer);
  }

  /**
   * Emit a chat message to the townService
   *
   * @param message
   */
  public emitChatMessage(message: ChatMessage) {
    this._socket.emit('chatMessage', message);
  }

  /**
   * Sends an InteractableArea command to the townService. Returns a promise that resolves
   * when the command is acknowledged by the server.
   *
   * If the command is not acknowledged within SOCKET_COMMAND_TIMEOUT_MS, the promise will reject.
   *
   * If the command is acknowledged successfully, the promise will resolve with the payload of the response.
   *
   * If the command is acknowledged with an error, the promise will reject with the error.
   *
   * @param interactableID ID of the interactable area to send the command to
   * @param command The command to send @see InteractableCommand
   * @returns A promise for the InteractableResponse corresponding to the command
   *
   **/
  public async sendInteractableCommand<CommandType extends InteractableCommand>(
    interactableID: InteractableID,
    command: CommandType,
  ): Promise<InteractableCommandResponse<CommandType>['payload']> {
    const commandMessage: InteractableCommand & InteractableCommandBase = {
      ...command,
      commandID: nanoid(),
      interactableID: interactableID,
    };
    return new Promise((resolve, reject) => {
      const watchdog = setTimeout(() => {
        reject('Command timed out');
      }, SOCKET_COMMAND_TIMEOUT_MS);

      const ackListener = (response: InteractableCommandResponse<CommandType>) => {
        if (response.commandID === commandMessage.commandID) {
          clearTimeout(watchdog);
          this._socket.off('commandResponse', ackListener);
          if (response.error) {
            reject(response.error);
          } else {
            resolve(response.payload);
          }
        }
      };
      this._socket.on('commandResponse', ackListener);
      this._socket.emit('interactableCommand', commandMessage);
    });
  }

  /**
   * Update the settings of the current town. Sends the request to update the settings to the townService,
   * and does not update the local model. If the update is successful, then the townService will inform us
   * of the updated settings. Throws an error if the request is not successful.
   *
   * @param roomUpdatePassword
   * @param updatedSettings
   */
  async updateTown(
    roomUpdatePassword: string,
    updatedSettings: { isPubliclyListed: boolean; friendlyName: string },
  ) {
    await this._townsService.updateTown(this._townID, roomUpdatePassword, updatedSettings);
  }

  /**
   * Delete the current town. Sends the request to the townService, and sends an error if the request is
   * not successful
   *
   * @param roomUpdatePassword
   */
  async deleteTown(roomUpdatePassword: string) {
    await this._townsService.deleteTown(this._townID, roomUpdatePassword);
  }

  /**
   * Create a new conversation area, sending the request to the townService. Throws an error if the request
   * is not successful. Does not immediately update local state about the new conversation area - it will be
   * updated once the townService creates the area and emits an interactableUpdate
   *
   * @param newArea
   */
  async createConversationArea(newArea: { topic?: string; id: string; occupants: Array<string> }) {
    await this._townsService.createConversationArea(this.townID, this.sessionToken, newArea);
  }

  /**
   * Create a new viewing area, sending the request to the townService. Throws an error if the request
   * is not successful. Does not immediately update local state about the new viewing area - it will be
   * updated once the townService creates the area and emits an interactableUpdate
   *
   * @param newArea
   */
  async createViewingArea(newArea: Omit<ViewingAreaModel, 'type'>) {
    await this._townsService.createViewingArea(this.townID, this.sessionToken, newArea);
  }

  /**
   * Disconnect from the town, notifying the townService that we are leaving and returning
   * to the login page
   */
  public disconnect() {
    this._socket.disconnect();
    this._loginController.setTownController(null);
  }

  /**
   * Connect to the townService. Throws an error if it is unable to connect
   * @returns
   */
  public async connect() {
    /*
         The connection is only valid if we receive an 'initialize' callback, and is invalid if the disconnect
         handler is called. Wrap the return of connect in a promise that is resolved upon initialize or rejected
         upon disconnect.
         */
    return new Promise<void>((resolve, reject) => {
      this._socket.connect();
      this._socket.on('initialize', initialData => {
        this._providerVideoToken = initialData.providerVideoToken;
        this._friendlyNameInternal = initialData.friendlyName;
        this._townIsPubliclyListedInternal = initialData.isPubliclyListed;
        this._sessionToken = initialData.sessionToken;
        this._players = initialData.currentPlayers.map(eachPlayerModel =>
          PlayerController.fromPlayerModel(eachPlayerModel),
        );

        this._interactableControllers = [];
        initialData.interactables.forEach(eachInteractable => {
          if (isConversationArea(eachInteractable)) {
            this._interactableControllers.push(
              ConversationAreaController.fromConversationAreaModel(
                eachInteractable,
                this._playersByIDs.bind(this),
              ),
            );
          } else if (isViewingArea(eachInteractable)) {
            this._interactableControllers.push(new ViewingAreaController(eachInteractable));
          } else if (isTicTacToeArea(eachInteractable)) {
            this._interactableControllers.push(
              new TicTacToeAreaController(eachInteractable.id, eachInteractable, this),
            );
          }
        });
        this._userID = initialData.userID;
        this._ourPlayer = this.players.find(eachPlayer => eachPlayer.id == this.userID);
        this.emit('connect', initialData.providerVideoToken);
        resolve();
      });
      this._socket.on('disconnect', () => {
        reject(new Error('Invalid town ID'));
      });
    });
  }

  /**
   * Retrieve the viewing area controller that corresponds to a viewingAreaModel, creating one if necessary
   *
   * @param viewingArea
   * @returns
   */
  public getViewingAreaController(viewingArea: ViewingArea): ViewingAreaController {
    const existingController = this._interactableControllers.find(
      eachExistingArea => eachExistingArea.id === viewingArea.name,
    );
    if (existingController instanceof ViewingAreaController) {
      return existingController;
    } else {
      throw new Error(`No such viewing area controller ${existingController}`);
    }
  }

  public getConversationAreaController(
    converationArea: ConversationArea,
  ): ConversationAreaController {
    const existingController = this._interactableControllers.find(
      eachExistingArea => eachExistingArea.id === converationArea.name,
    );
    if (existingController instanceof ConversationAreaController) {
      return existingController;
    } else {
      throw new Error(`No such viewing area controller ${existingController}`);
    }
  }

  /**
   * Retrives the game area controller corresponding to a game area by ID, or
   * throws an error if the game area controller does not exist
   *
   * @param gameArea
   * @returns
   */
  public getGameAreaController<GameType extends GameState, EventsType extends GameEventTypes>(
    gameArea: GameArea,
  ): GameAreaController<GameType, EventsType> {
    const existingController = this._interactableControllers.find(
      eachExistingArea => eachExistingArea.id === gameArea.name,
    );
    if (existingController instanceof GameAreaController) {
      return existingController as GameAreaController<GameType, EventsType>;
    } else {
      throw new Error('Game area controller not created');
    }
  }

  /**
   * Emit a viewing area update to the townService
   * @param viewingArea The Viewing Area Controller that is updated and should be emitted
   *    with the event
   */
  public emitViewingAreaUpdate(viewingArea: ViewingAreaController) {
    this._socket.emit('interactableUpdate', viewingArea.toInteractableAreaModel());
  }

  /**
   * Determine which players are "nearby" -- that they should be included in our video call
   */
  public nearbyPlayers(): PlayerController[] {
    const isNearby = (p: PlayerController) => {
      if (p.location && this.ourPlayer.location) {
        if (this.ourPlayer.location.interactableID || p.location.interactableID) {
          return p.location.interactableID === this.ourPlayer.location.interactableID;
        }
        const dx = p.location.x - this.ourPlayer.location.x;
        const dy = p.location.y - this.ourPlayer.location.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        return d < 80;
      }
      return false;
    };
    return this.players.filter(p => isNearby(p));
  }

  private _playersByIDs(playerIDs: string[]): PlayerController[] {
    return this._playersInternal.filter(eachPlayer => playerIDs.includes(eachPlayer.id));
  }
}

/**
 * A react hook to retrieve the settings for this town
 *
 * This hook will cause components that use it to re-render when the settings change.
 *
 * This hook relies on the TownControllerContext.
 * @returns an object with the properties "friendlyName" and "isPubliclyListed",
 *  representing the current settings of the current town
 */
export function useTownSettings() {
  const townController = useTownController();
  const [friendlyName, setFriendlyName] = useState<string>(townController.friendlyName);
  const [isPubliclyListed, setIsPubliclyListed] = useState<boolean>(
    townController.townIsPubliclyListed,
  );
  useEffect(() => {
    const updateTownSettings = (update: TownSettingsUpdate) => {
      const newName = update.friendlyName;
      const newPublicSetting = update.isPubliclyListed;
      if (newName !== undefined) {
        setFriendlyName(newName);
      }
      if (newPublicSetting !== undefined) {
        setIsPubliclyListed(newPublicSetting);
      }
    };
    townController.addListener('townSettingsUpdated', updateTownSettings);
    return () => {
      townController.removeListener('townSettingsUpdated', updateTownSettings);
    };
  }, [townController]);
  return { friendlyName, isPubliclyListed };
}

/**
 * A react hook to retrieve an interactable area controller
 *
 * This function will throw an error if the interactable area controller does not exist.
 *
 * This hook relies on the TownControllerContext.
 *
 * @param interactableAreaID The ID of the interactable area to retrieve the controller for
 * @throws Error if there is no interactable area controller matching the specified ID
 */
export function useInteractableAreaController<T>(interactableAreaID: string): T {
  const townController = useTownController();
  const interactableAreaController = townController.gameAreas.find(
    eachArea => eachArea.id == interactableAreaID,
  );
  if (!interactableAreaController) {
    throw new Error(`Requested interactable area ${interactableAreaID} does not exist`);
  }
  return interactableAreaController as unknown as T;
}

/**
 * A react hook to retrieve the active conversation areas. This hook will re-render any components
 * that use it when the set of conversation areas changes. It does *not* re-render its dependent components
 * when the state of one of those areas changes - if that is desired, @see useConversationAreaTopic and @see useConversationAreaOccupants
 *
 * This hook relies on the TownControllerContext.
 *
 * @returns the list of conversation area controllers that are currently "active"
 */
export function useActiveConversationAreas(): ConversationAreaController[] {
  const townController = useTownController();
  const [conversationAreas, setConversationAreas] = useState<ConversationAreaController[]>(
    townController.conversationAreas.filter(eachArea => !eachArea.isEmpty()),
  );
  useEffect(() => {
    const updater = () => {
      const allAreas = townController.conversationAreas;
      setConversationAreas(allAreas.filter(eachArea => !eachArea.isEmpty()));
    };
    townController.addListener('interactableAreasChanged', updater);
    return () => {
      townController.removeListener('interactableAreasChanged', updater);
    };
  }, [townController, setConversationAreas]);
  return conversationAreas;
}

/**
 * A react hook to return the PlayerController's corresponding to each player in the town.
 *
 * This hook will cause components that use it to re-render when the set of players in the town changes.
 *
 * This hook will *not* trigger re-renders if a player moves.
 *
 * This hook relies on the TownControllerContext.
 *
 * @returns an array of PlayerController's, representing the current set of players in the town
 */
export function usePlayers(): PlayerController[] {
  const townController = useTownController();
  const [players, setPlayers] = useState<PlayerController[]>(townController.players);
  useEffect(() => {
    townController.addListener('playersChanged', setPlayers);
    return () => {
      townController.removeListener('playersChanged', setPlayers);
    };
  }, [townController, setPlayers]);
  return players;
}

function samePlayers(a1: PlayerController[], a2: PlayerController[]) {
  if (a1.length !== a2.length) return false;
  const ids1 = a1.map(p => p.id).sort();
  const ids2 = a2.map(p => p.id).sort();
  return _.isEqual(ids1, ids2);
}

/**
 * A react hook to retrieve the interactable that is *currently* be interacted with by the player in this frontend.
 * A player is "interacting" with the Interactable if they are within it, and press the spacebar.
 *
 * This hook will cause any component that uses it to re-render when the object that the player is interacting with changes.
 *
 * This hook relies on the TownControllerContext.
 *
 * @param interactableType
 */
export function useInteractable<T extends Interactable>(
  interactableType: T['name'],
): T | undefined {
  const townController = useTownController();
  const [interactable, setInteractable] = useState<T | undefined>(undefined);
  useEffect(() => {
    const onInteract = (interactWith: T) => {
      setInteractable(interactWith);
    };
    const offInteract = () => {
      setInteractable(undefined);
    };
    townController.interactableEmitter.on(interactableType, onInteract);
    townController.interactableEmitter.on('endInteraction', offInteract);

    return () => {
      townController.interactableEmitter.off(interactableType, onInteract);
      townController.interactableEmitter.off('endInteraction', offInteract);
    };
  }, [interactableType, townController, setInteractable]);
  return interactable;
}
/**
 * A react hook to retrieve the players that should be included in the video call
 *
 * This hook will cause components that  use it to re-render when the set of players in the video call changes.
 *
 * This hook relies on the TownControllerContext.
 * @returns
 */
export function usePlayersInVideoCall(): PlayerController[] {
  const townController = useTownController();
  const [playersInCall, setPlayersInCall] = useState<PlayerController[]>([]);
  useEffect(() => {
    let lastRecalculatedNearbyPlayers = 0;
    let prevNearbyPlayers: PlayerController[] = [];
    const updatePlayersInCall = () => {
      const now = Date.now();
      // To reduce re-renders, only recalculate the nearby players every so often
      if (now - lastRecalculatedNearbyPlayers > CALCULATE_NEARBY_PLAYERS_DELAY_MS) {
        lastRecalculatedNearbyPlayers = now;
        const nearbyPlayers = townController.nearbyPlayers();
        if (!samePlayers(nearbyPlayers, prevNearbyPlayers)) {
          prevNearbyPlayers = nearbyPlayers;
          setPlayersInCall(nearbyPlayers);
        }
      }
    };
    townController.addListener('playerMoved', updatePlayersInCall);
    townController.addListener('playersChanged', updatePlayersInCall);
    updatePlayersInCall();
    return () => {
      townController.removeListener('playerMoved', updatePlayersInCall);
      townController.removeListener('playersChanged', updatePlayersInCall);
    };
  }, [townController, setPlayersInCall]);
  return playersInCall;
}
