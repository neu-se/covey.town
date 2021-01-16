import React, {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useReducer, useState} from 'react';
import './App.css';
import WorldMap from './components/world/WorldMap';
import VideoOverlay from './components/VideoCall/VideoOverlay/VideoOverlay';
import {BrowserRouter} from "react-router-dom";
import {CoveyAppState, NearbyPlayers, UserLocation} from "./CoveyTypes";
import VideoContext from './contexts/VideoContext';
import Video, {JoinRoomResponse} from "./classes/Video/Video";
import Login from "./components/Login/Login";
import CoveyAppContext from './contexts/CoveyAppContext';
import {io, Socket} from "socket.io-client";
import NearbyPlayersContext from './contexts/NearbyPlayersContext';
import {ChakraProvider} from '@chakra-ui/react';
import AppStateProvider, {useAppState} from "./components/VideoCall/VideoFrontend/state";
import useConnectionOptions from "./components/VideoCall/VideoFrontend/utils/useConnectionOptions/useConnectionOptions";
import UnsupportedBrowserWarning
    from "./components/VideoCall/VideoFrontend/components/UnsupportedBrowserWarning/UnsupportedBrowserWarning";
import {VideoProvider} from "./components/VideoCall/VideoFrontend/components/VideoProvider";
import ErrorDialog from "./components/VideoCall/VideoFrontend/components/ErrorDialog/ErrorDialog";
import {MuiThemeProvider} from "@material-ui/core/styles";
import theme from "./components/VideoCall/VideoFrontend/theme";
import {Callback} from "./components/VideoCall/VideoFrontend/types";
import assert from "assert";
import Player, {ServerPlayer} from "./classes/Player";

type CoveyAppUpdate =
    | { action: "doConnect"; data: { userName: string, roomName: string, sessionToken: string, myPlayerID: string, socket: Socket, players: ServerPlayer[], emitMovement: (location: UserLocation) => void } }
    | { action: "addPlayer"; player: ServerPlayer }
    | { action: "playerMoved"; player: ServerPlayer }
    | { action: "playerDisconnect"; player: ServerPlayer }
    | { action: "weMoved"; location: UserLocation }
    | { action: "disconnect" }
    ;

function appStateReducer(state: CoveyAppState, update: CoveyAppUpdate): CoveyAppState {
    const nextState = {
        sessionToken: state.sessionToken,
        currentRoom: state.currentRoom,
        myPlayerID: state.myPlayerID,
        players: state.players,
        currentLocation: state.currentLocation,
        nearbyPlayers: state.nearbyPlayers,
        userName: state.userName,
        socket: state.socket,
        emitMovement: state.emitMovement
    };

    function calculateNearbyPlayers(players: Player[], currentLocation: UserLocation) {
        const isWithinCallRadius = (p: Player, currentLocation: UserLocation) => {
            if (p.location && currentLocation) {
                let dx = p.location.x - currentLocation.x;
                let dy = p.location.y - currentLocation.y;
                let d = Math.sqrt(dx * dx + dy * dy);
                return d < 80;
            }
            return false;
        }
        return {nearbyPlayers: players.filter(p => isWithinCallRadius(p, currentLocation))};
    }

    function samePlayers(a1: NearbyPlayers, a2: NearbyPlayers) {
        if (a1.nearbyPlayers.length !== a2.nearbyPlayers.length)
            return false;
        let ids1 = a1.nearbyPlayers.map(p => p.id).sort();
        let ids2 = a2.nearbyPlayers.map(p => p.id).sort();
        return !ids1.some((val, idx) => val !== ids2[idx]);
    }

    switch (update.action) {
        case "doConnect":
            nextState.sessionToken = update.data.sessionToken;
            nextState.myPlayerID = update.data.myPlayerID;
            nextState.currentRoom = update.data.roomName;
            nextState.userName = update.data.userName;
            nextState.emitMovement = update.data.emitMovement;
            nextState.socket = update.data.socket;
            nextState.players = update.data.players.map(sp => new Player(sp));
            break;
        case "addPlayer":
            nextState.players = nextState.players.concat([new Player(update.player)]);
            break;
        case "playerMoved":
            const updatePlayer = nextState.players.find(p => p.id == update.player._id);
            console.log(updatePlayer)
            if (updatePlayer) {
                console.log("update location to: ")
                console.log(update.player.location)
                updatePlayer.location = update.player.location;
            } else {
                nextState.players = nextState.players.concat([new Player(update.player)]);
            }
            nextState.nearbyPlayers = calculateNearbyPlayers(nextState.players, nextState.currentLocation);
            if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
                nextState.nearbyPlayers = state.nearbyPlayers;
            }
            break;
        case "weMoved":
            nextState.currentLocation = update.location;
            nextState.nearbyPlayers = calculateNearbyPlayers(nextState.players, nextState.currentLocation);
            if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
                nextState.nearbyPlayers = state.nearbyPlayers;
            }

            break;
        case "playerDisconnect":
            nextState.players = nextState.players.filter(player => player.id !== update.player._id);

            nextState.nearbyPlayers = calculateNearbyPlayers(nextState.players, nextState.currentLocation);
            if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
                nextState.nearbyPlayers = state.nearbyPlayers;
            }
            break;
        case "disconnect":
            state.socket?.disconnect();
            return defaultAppState();
    }

    return nextState;
}

async function GameController(initData: JoinRoomResponse, dispatchAppUpdate: (update: CoveyAppUpdate) => void) {
    //Now, set up the game sockets
    const gamePlayerID = initData.coveyUserID;
    const sessionToken = initData.coveySessionToken;
    const url = process.env.REACT_APP_TWILIO_CALLBACK_URL;
    assert(url);
    const video = Video.instance();
    assert(video);
    const roomName = video.getTwilioRoomID();
    assert(roomName);

    const socket = io(url, {auth: {token: sessionToken, coveyRoomID: roomName}});
    socket.on("newPlayer", (player: ServerPlayer) => {
        dispatchAppUpdate({action: "addPlayer", player: player});
    });
    socket.on("playerMoved", (player: ServerPlayer) => {
        if (player._id !== gamePlayerID) {
            dispatchAppUpdate({action: "playerMoved", player: player});
        }
    });
    socket.on("playerDisconnect", (player: ServerPlayer) => {
        dispatchAppUpdate({action: "playerDisconnect", player: player});
    });
    socket.on("disconnect", () => {
        dispatchAppUpdate({action: "disconnect"});
    })
    const emitMovement = (location: UserLocation) => {
        socket.emit("playerMovement", location);
        dispatchAppUpdate({action: "weMoved", location: location});
    }

    dispatchAppUpdate({
        action: "doConnect",
        data: {
            sessionToken: sessionToken,
            userName: video.userName,
            roomName: roomName,
            myPlayerID: gamePlayerID,
            emitMovement: emitMovement,
            socket: socket,
            players: initData.currentPlayers
        }
    });
    return true;
}

function defaultAppState(): CoveyAppState {
    return {
        nearbyPlayers: {nearbyPlayers: []},
        players: [],
        myPlayerID: "",
        currentRoom: "",
        sessionToken: "",
        userName: "",
        socket: null,
        currentLocation: {x: 0, y: 0, rotation: "front", moving: false},
        emitMovement: (location: UserLocation) => {
        }
    };
}

function App(props: { setOnDisconnect: Dispatch<SetStateAction<Callback | undefined>> }) {
    const [appState, dispatchAppUpdate] = useReducer(appStateReducer, defaultAppState());

    const setupGameController = useCallback(async (initData: JoinRoomResponse) => {
        await GameController(initData, dispatchAppUpdate);
        return true;
    }, [dispatchAppUpdate]);
    const videoInstance = Video.instance();

    const setOnDisconnect = props.setOnDisconnect;
    useEffect(() => {
        setOnDisconnect(() => async () => { //Here's a great gotcha: https://medium.com/swlh/how-to-store-a-function-with-the-usestate-hook-in-react-8a88dd4eede1
            dispatchAppUpdate({action: "disconnect"});
            return Video.teardown();
        });
    }, [dispatchAppUpdate, setOnDisconnect]);

    let page = useMemo(() => {
        if (!appState.sessionToken) {
            return <Login doLogin={setupGameController}/>
        } else if (!videoInstance) {
            return <div>Loading...</div>;
        } else {
            return <div>
                <WorldMap/>
                <VideoOverlay preferredMode={"fullwidth"}/>
            </div>
        }
    }, [setupGameController, appState.sessionToken, videoInstance]);
    return (

        <CoveyAppContext.Provider value={appState}>
            <VideoContext.Provider value={Video.instance()}>
                <NearbyPlayersContext.Provider value={appState.nearbyPlayers}>
                    {page}
                </NearbyPlayersContext.Provider>
            </VideoContext.Provider>
        </CoveyAppContext.Provider>

    );
}

function EmbeddedTwilioAppWrapper() {
    const {error, setError} = useAppState();
    const [onDisconnect, setOnDisconnect] = useState<Callback | undefined>();
    const connectionOptions = useConnectionOptions();
    return <UnsupportedBrowserWarning>
        <VideoProvider options={connectionOptions} onError={setError} onDisconnect={onDisconnect}>
            <ErrorDialog dismissError={() => setError(null)} error={error}/>
            <App setOnDisconnect={setOnDisconnect}/>
        </VideoProvider>
    </UnsupportedBrowserWarning>
}

export default function AppStateWrapper() {
    return (
        <BrowserRouter>
            <ChakraProvider>
                <MuiThemeProvider theme={theme("rgb(185, 37, 0)")}>
                    <AppStateProvider preferredMode={"fullwidth"} highlightedProfiles={[]}>
                        <EmbeddedTwilioAppWrapper/>
                    </AppStateProvider>
                </MuiThemeProvider>
            </ChakraProvider>
        </BrowserRouter>
    );
}
