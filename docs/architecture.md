# Overall Design

This application uses an event-oriented architecture to share information and implement the application logic. One way to think of the application is as a set of frontend instances (browser tabs connected to the application), and a backend TownService.

The sequence diagram below shows the kinds of high-level events that occur in the application, assuming that there are two frontends connected:

```mermaid
sequenceDiagram
    participant F1 as Avery's Frontend
    participant B as Backend TownService
    participant F2 as Calin's Frontend
    F1->>B: Create a new town
    B-->>F1: ID for new town
    F1->>B: Join town
    activate B
    B-->>F1: Current state of the town
    F2->>B: Join town
    B-->>F2: Current state of the town
    B->>F1: Calin Joined
    F1->>B: I moved to a new location
    B->>F2: Avery moved
    F2->>B: Disconnect
    B-->F1: Calin Disconnected
    F1->>B: Disconnect
    deactivate B
```

## Key components

### Backend

The `TownsController` implements the REST protocol and also sets up new socket connections. The `Town` class maintains the state for each active town.

```mermaid
classDiagram
class TownsController{
    +Town[] listTowns()
    +TownCreateResponse createTown(newTown)
    +void updateTown(townID, password)
    +void deleteTown(townID, password)
    +void createConversationArea(townID, sessionToken, newArea)
    +void joinTown(socket)
}
class Town{
    +string townID
    +string friendlyName
    +Player[] players
    +ConversationArea[] conversationAreas
    +addPlayer(userName, socket)
    +removePlayer(player)
    +updatePlayerLocation(player, location)
    +addConversationArea(conversationAreaToAdd)
    +addListener(eventName, listener)
    +removeListener(eventName, listener)
}

```

### Frontend

```mermaid
classDiagram
class TownController{
    +string userID
    +string userName
    +string friendlyName
    +boolean paused
    +Player[] players
    +ConversationArea[] conversationAreas
    +disconnect()
    +connect()
    +emitMovement(newLocation)
    +emitChatMessage(chatMessage)
    +addListener(eventName, listener)
    +removeListener(eventName, listener)
}
```

## Event flows

### Before joining a town

Before a user connects to a town, all communication between the frontend and the backend occurs over the `towns` REST API, which is described and implemented in `townService/src/town/TownsController.ts`. The API is accessed in React code through the `townService` property of the `LoginController`.

### While in a town

While a user is in a town, communication between the frontend and the backend occurs primarily over the socket API. The events that are shared over the socket protocol are defined in `shared/types/CoveyTownSocket.d.ts`:

```ts
export interface ServerToClientEvents {
  playerMoved: (movedPlayer: Player) => void;
  playerDisconnect: (disconnectedPlayer: Player) => void;
  playerJoined: (newPlayer: Player) => void;
  initialize: (initialData: TownJoinResponse) => void;
  townSettingsUpdated: (update: TownSettingsUpdate) => void;
  townClosing: () => void;
  conversationAreaUpdated: (conversationArea: ConversationArea) => void;
  conversationAreaDestroyed: (conversationArea: ConversationArea) => void;
  chatMessage: (message: ChatMessage) => void;
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
  playerMovement: (movementData: PlayerLocation) => void;
}
```

This protocol is implemented on the backend in `townService/src/town/Town.ts`, and on the frontend in `frontend/src/classes/TownController.ts`. The types that are shared over the socket are simple structs (serializing TypeScript classes is non-trivial), and the protocol is designed to minimize the size of messages - it only includes the entire state of the town in the `initialize` response, and sends diffs otherwise.

For example, this diagram shows the same sequence of events above from "Join Town", showing only Avery's frontend and the backend:

```mermaid
sequenceDiagram
    participant AC as Avery's TownController
    participant BC as Town (Backend)
    participant CC as Calin's TownController
    AC->>BC: Open socket connection
    activate BC
    BC-->>AC: initialize(curent state of town)
    CC->>BC: Open socket connection
    BC-->>CC: initialize(current state of town)
    BC->>AC: playerJoined(Calin)
    AC->>BC: playerMovement(newLocation)
    BC->>CC: playerMoved(Avery)
    CC->>BC: disconnect
    BC->>AC: playerDisconnect(Calin)
    AC->>BC: disconnect
    deactivate BC
```

#### TownEvents in the frontend

The frontend TownController tracks the current state of the town, applying updates as they are sent by the server, and exposes a different event format, `TownEvents` that other frontend components can subscribe to. For convenience when using React components, there are also a variety of React hooks available, which can be used to subscribe to application state, triggering a re-render when that state changes.

For example, this diagram demonstrates the flow of events:

```mermaid
sequenceDiagram
    participant BC as Town (Backend)
    participant TC as TownController
    participant UP as UsePlayers hook
    participant GS as CoveyGameScene

    BC->>TC: playerJoined(Calin)
    activate TC
    TC->>UP: playersChanged(currentPlayers)
    UP->>UP: Re-renders dependent components
    TC->>GS: playersChanged(currentPlayers)
    GS->>GS: Adds Calin to 2D map
    deactivate TC
```
