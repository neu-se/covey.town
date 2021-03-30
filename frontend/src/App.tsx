/* eslint-disable */

import React, {
  Dispatch, SetStateAction, useCallback, useEffect, useMemo, useReducer, useState,
} from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { ChakraProvider, FormLabel } from '@chakra-ui/react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import assert from 'assert';
import YouTube from 'react-youtube'; // Andrew - this is the package that we use as a light wrapper around the iframe component
import { YouTubePlayer } from 'youtube-player/dist/types'; // Andrew - This is the interface for the youtube player from the react-youtube package
import WorldMap from './components/world/WorldMap';
import VideoOverlay from './components/VideoCall/VideoOverlay/VideoOverlay';
import { CoveyAppState, NearbyPlayers, YoutubeVideoInfo } from './CoveyTypes';
import VideoContext from './contexts/VideoContext';
import Login from './components/Login/Login';
import CoveyAppContext from './contexts/CoveyAppContext';
import NearbyPlayersContext from './contexts/NearbyPlayersContext';
import AppStateProvider, { useAppState } from './components/VideoCall/VideoFrontend/state';
import useConnectionOptions from './components/VideoCall/VideoFrontend/utils/useConnectionOptions/useConnectionOptions';
import UnsupportedBrowserWarning
  from './components/VideoCall/VideoFrontend/components/UnsupportedBrowserWarning/UnsupportedBrowserWarning';
import { VideoProvider } from './components/VideoCall/VideoFrontend/components/VideoProvider';
import ErrorDialog from './components/VideoCall/VideoFrontend/components/ErrorDialog/ErrorDialog';
import theme from './components/VideoCall/VideoFrontend/theme';
import { Callback } from './components/VideoCall/VideoFrontend/types';
import Player, { ServerPlayer, UserLocation } from './classes/Player';
import TownsServiceClient, { TownJoinResponse } from './classes/TownsServiceClient';
import Video from './classes/Video/Video';
import { ContactSupportOutlined } from '@material-ui/icons';

type CoveyAppUpdate =
  | { action: 'doConnect'; data: { userName: string, townFriendlyName: string, townID: string,townIsPubliclyListed:boolean, sessionToken: string, myPlayerID: string, socket: Socket, players: Player[], emitMovement: (location: UserLocation) => void } }
  | { action: 'addPlayer'; player: Player }
  | { action: 'playerMoved'; player: Player }
  | { action: 'playerDisconnect'; player: Player }
  | { action: 'weMoved'; location: UserLocation }
  | { action: 'disconnect' }
  | { action: 'playerPaused'; } // Andrew - action is set off when server tells client that another client's youtube player paused
  | { action: 'playerPlayed'; } // Andrew - action is set off when server tells client that another client's youtube player played
  | { action: 'addYTplayer'; ytplayer: YouTubePlayer } // Andrew - when the youtube react component renders, this ytplayer variable is set to the rendered youtube player
  | { action: 'syncVideo'; videoInfo: YoutubeVideoInfo } // Andrew - tells the youtube player to load given video URL, timestamp, and playing/paused
  | { action: 'nullifyYTplayer' } // Andrew - sets youtube player to null so that accidental emits from "ghost" youtube player renders do not occur
  | { action: 'clearSyncInterval'} // Andrew - remove the setInterval that sends video info to the server regularly
  ;

function defaultAppState(): CoveyAppState {
  return {
    nearbyPlayers: { nearbyPlayers: [] },
    players: [],
    myPlayerID: '',
    currentTownFriendlyName: '',
    currentTownID: '',
    currentTownIsPubliclyListed: false,
    sessionToken: '',
    userName: '',
    socket: null,
    currentLocation: {
      x: 0, y: 0, rotation: 'front', moving: false,
    },
    emitMovement: () => {
    },
    apiClient: new TownsServiceClient(),
    videoPlaying: false, // Andrew - this might not be necessary but it is supposed to maintain state of if youtube player is playing
    youtubeplayer: null, // Andrew - holds the current youtube player object since the youtube players re-render when you go near the TV
    showYTPlayer: false, // Andrew - boolean that controls whether youtube player react component renders or not
    mostRecentVideoSync: null, // Andrew - most recent video info from server
    youtubeplayers: [], // Andrew - this isn't necessary right now but this was used before when multiple youtube players were being rendered
    syncInterval: null, // Andrew - the setInterval Timeout that sends video info
  };
}
function appStateReducer(state: CoveyAppState, update: CoveyAppUpdate): CoveyAppState {
  const nextState = {
    sessionToken: state.sessionToken,
    currentTownFriendlyName: state.currentTownFriendlyName,
    currentTownID: state.currentTownID,
    currentTownIsPubliclyListed: state.currentTownIsPubliclyListed,
    myPlayerID: state.myPlayerID,
    players: state.players,
    currentLocation: state.currentLocation,
    nearbyPlayers: state.nearbyPlayers,
    userName: state.userName,
    socket: state.socket,
    emitMovement: state.emitMovement,
    apiClient: state.apiClient,
    videoPlaying: state.videoPlaying,
    youtubeplayer: state.youtubeplayer,
    showYTPlayer: state.showYTPlayer,
    mostRecentVideoSync: state.mostRecentVideoSync,
    youtubeplayers: state.youtubeplayers,
    syncInterval: state.syncInterval,
  };

  function calculateNearbyPlayers(players: Player[], currentLocation: UserLocation) {
    const isWithinCallRadius = (p: Player, location: UserLocation) => {
      if (p.location && location) {
        const dx = p.location.x - location.x;
        const dy = p.location.y - location.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        return d < 80;
      }
      return false;
    };
    return { nearbyPlayers: players.filter((p) => isWithinCallRadius(p, currentLocation)) };
  }

  function samePlayers(a1: NearbyPlayers, a2: NearbyPlayers) {
    if (a1.nearbyPlayers.length !== a2.nearbyPlayers.length) return false;
    const ids1 = a1.nearbyPlayers.map((p) => p.id).sort();
    const ids2 = a2.nearbyPlayers.map((p) => p.id).sort();
    return !ids1.some((val, idx) => val !== ids2[idx]);
  }

  let updatePlayer;
  switch (update.action) {
    case 'doConnect':
      nextState.sessionToken = update.data.sessionToken;
      nextState.myPlayerID = update.data.myPlayerID;
      nextState.currentTownFriendlyName = update.data.townFriendlyName;
      nextState.currentTownID = update.data.townID;
      nextState.currentTownIsPubliclyListed = update.data.townIsPubliclyListed;
      nextState.userName = update.data.userName;
      nextState.emitMovement = update.data.emitMovement;
      nextState.socket = update.data.socket;
      nextState.players = update.data.players;
      break;
    case 'addPlayer':
      nextState.players = nextState.players.concat([update.player]);
      break;
    case 'playerMoved':
      updatePlayer = nextState.players.find((p) => p.id === update.player.id);
      if (updatePlayer) {
        updatePlayer.location = update.player.location;
      } else {
        nextState.players = nextState.players.concat([update.player]);
      }
      nextState.nearbyPlayers = calculateNearbyPlayers(nextState.players,
        nextState.currentLocation);
      if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
        nextState.nearbyPlayers = state.nearbyPlayers;
      }
      break;
    case 'weMoved':
      nextState.currentLocation = update.location;
      nextState.nearbyPlayers = calculateNearbyPlayers(nextState.players,
        nextState.currentLocation);
      if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
        nextState.nearbyPlayers = state.nearbyPlayers;
      }

      // Andrew - when player is near TV, show the youtube react component, and when it is not then take it away
      const xLoc = update.location.x;
      const yLoc = update.location.y;
      if (xLoc > 250 && xLoc < 360 && yLoc > 770 && yLoc < 900) { // this is the area around the tv
        if (!state.showYTPlayer) { // Andrew - NOTE TO SELF: maybe this is where syncing should be requested from server instead of onReady
          nextState.showYTPlayer = true;
        }
      } else if (state.showYTPlayer) {
        nextState.showYTPlayer = false;
        state.socket?.emit('clientLeftTVArea');
      }
      break;
    case 'playerDisconnect':
      nextState.players = nextState.players.filter((player) => player.id !== update.player.id);

      nextState.nearbyPlayers = calculateNearbyPlayers(nextState.players,
        nextState.currentLocation);
      if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
        nextState.nearbyPlayers = state.nearbyPlayers;
      }
      break;
    case 'disconnect':
      state.socket?.disconnect();
      return defaultAppState();
    case 'playerPaused': // Andrew - pause youtube video 
      nextState.videoPlaying = false;
      if (state.showYTPlayer) {
        state.youtubeplayer?.pauseVideo();
      }
      break;
    case 'playerPlayed': // Andrew - play youtube video
      nextState.videoPlaying = true;
      if (state.showYTPlayer) {
        state.youtubeplayer?.playVideo();
      }
      break;
    case 'syncVideo': // Andrew - convert video URL to video ID and load video as given by videoInfo
      console.log(update.videoInfo.url);
      const vidID = update.videoInfo.url.split('=')[update.videoInfo.url.split('=').length - 1];
      
      state.youtubeplayer?.loadVideoById(vidID, update.videoInfo.timestamp + 1);
      if (!(update.videoInfo.isPlaying)) {
        state.youtubeplayer?.pauseVideo();
      } else {
        state.youtubeplayer?.playVideo(); 
      }
      break;
    case 'addYTplayer': // Andrew - add newly rendered youtube player to state and start a setInterval to send video info to server
      if (state.syncInterval) {
        clearTimeout(state.syncInterval)
      }
      nextState.youtubeplayer = update.ytplayer;
      // nextState.youtubeplayers.push(update.ytplayer); // Don't think i use this, but i'm keeping it since it might be a workaround for React.StrictMode issue
      nextState.syncInterval = setInterval(() => {
        if (state.showYTPlayer) {
          // if (time.now() - state.lastScoketEmission < 200) // Andrew - Leaving here as a TA suggestion for emitting socket message
          state.socket?.emit('clientSharedVideoInfo', { url: update.ytplayer?.getVideoUrl(), timestamp: update.ytplayer?.getCurrentTime(), isPlaying: update.ytplayer?.getPlayerState() === 1 ? true : false })
          state.youtubeplayer?.playVideo(); 
        }
      }, 200)
      break;
    case 'nullifyYTplayer': // Andrew - set current youtube player to null to handle several renderings
      nextState.youtubeplayer = null;
      break;
    case 'clearSyncInterval': // Andrew - clear setInterval that sends regular video info to server
      if (nextState.syncInterval) {
        clearTimeout(nextState.syncInterval)
      }
      break;
    default:
      throw new Error('Unexpected state request');
  }

  return nextState;
}

const YoutubeWidget: React.FC<Props> = ({appState, dispatchAppUpdate}) => {

    //  After components unmounts, the setInterval will be cleared and player nullified
    useEffect(() => {
      // create interval here potentially; Andrew - suggestion from TA
      return () => {
        dispatchAppUpdate({ action: 'clearSyncInterval' });
        dispatchAppUpdate({ action: 'nullifyYTplayer' });
      }
    },[appState.syncInterval]); // if this variable changes (reliant on interval)); Andrew - suggestion from TA
  
    // Andrew - below is a <YouTube/> react component from the react-youtube package that is a wrapper for the iframe Youtube API
    return <YouTube
    opts={{height: '200', width: '400', playerVars: {enablejsapi: 1, controls: 1}}}
    onPause={(event) => {
        appState.socket?.emit('clientPaused');
    }}
    onPlay={(event) => {
        appState.socket?.emit('clientPlayed');
    }} 
    onReady={(event) => {
        console.log('YTPlayer added')
        dispatchAppUpdate({ action: 'addYTplayer', ytplayer: event.target })
        appState.socket?.emit('clientEnteredTVArea');
    }}
    onError={(event) => {
      console.log(event.data);
    }}
    onEnd={(event) => {
      console.log('end');
      appState.socket?.emit('clientVideoEnded');
    }}
    onStateChange={(event) => {
        // Andrew - this might be useful to add something here in the future, but it's not doing anything now
    }}/>};


async function GameController(initData: TownJoinResponse,
  dispatchAppUpdate: (update: CoveyAppUpdate) => void) {
  // Now, set up the game sockets
  const gamePlayerID = initData.coveyUserID;
  const sessionToken = initData.coveySessionToken;
  const url = process.env.REACT_APP_TOWNS_SERVICE_URL;
  assert(url);
  const video = Video.instance();
  assert(video);
  const roomName = video.townFriendlyName;
  assert(roomName);

  const socket = io(url, { auth: { token: sessionToken, coveyTownID: video.coveyTownID } });
  socket.on('newPlayer', (player: ServerPlayer) => {
    dispatchAppUpdate({
      action: 'addPlayer',
      player: Player.fromServerPlayer(player),
    });
  });
  socket.on('playerMoved', (player: ServerPlayer) => {
    if (player._id !== gamePlayerID) {
      dispatchAppUpdate({ action: 'playerMoved', player: Player.fromServerPlayer(player) });
    }
  });
  socket.on('playerDisconnect', (player: ServerPlayer) => {
    dispatchAppUpdate({ action: 'playerDisconnect', player: Player.fromServerPlayer(player) });
  });
  socket.on('disconnect', () => {
    dispatchAppUpdate({ action: 'disconnect' });
  });

  // Andrew - listens for server saying someone paused video
  socket.on('playerPaused', () => {
    dispatchAppUpdate({ action: 'playerPaused' });
  });
  // Andrew - listens for server saying someone played video
  socket.on('playerPlayed', () => {
    dispatchAppUpdate({ action: 'playerPlayed' });
  });
  // Andrew - listens for server telling client to load a certain video at certain timestamp
  socket.on('videoSynchronization', (currentVideoInfo: YoutubeVideoInfo) => {
    dispatchAppUpdate({ action: 'syncVideo', videoInfo: currentVideoInfo });
  });


  const emitMovement = (location: UserLocation) => {
    socket.emit('playerMovement', location);
    dispatchAppUpdate({ action: 'weMoved', location });
  };

  dispatchAppUpdate({
    action: 'doConnect',
    data: {
      sessionToken,
      userName: video.userName,
      townFriendlyName: roomName,
      townID: video.coveyTownID,
      myPlayerID: gamePlayerID,
      townIsPubliclyListed: video.isPubliclyListed,
      emitMovement,
      socket,
      players: initData.currentPlayers.map((sp) => Player.fromServerPlayer(sp)),
    },
  });
  return true;
}

// Andrew - interface to pass these sort of as parameters to the YTplayer component
interface Props {
  appState: CoveyAppState
  dispatchAppUpdate: Dispatch<CoveyAppUpdate>
}


// Andrew - this would be to add the widget for voting on videos
// const ButtonWidgets: React.FC<Prop> = 

// Andew - React component for the youtube player
// Adam Moved 
/* const YTplayer: React.FC<Props> = ({appState, dispatchAppUpdate}) => {

  //  After components unmounts, the setInterval will be cleared and player nullified
  useEffect(() => {
    // create interval here potentially; Andrew - suggestion from TA
    return () => {
      dispatchAppUpdate({ action: 'clearSyncInterval' });
      dispatchAppUpdate({ action: 'nullifyYTplayer' });
    }
  },[]); // if this variable changes (reliant on interval)); Andrew - suggestion from TA

  // Andrew - below is a <YouTube/> react component from the react-youtube package that is a wrapper for the iframe Youtube API
  // ADAM - Moved to YoutubeWidget
   return <YouTube
  opts={{height: '200', width: '400', playerVars: {enablejsapi: 1, controls: 1}}}
  onPause={(event) => {
      appState.socket?.emit('clientPaused');
  }}
  onPlay={(event) => {
      appState.socket?.emit('clientPlayed');
  }} 
  onReady={(event) => {
      console.log('YTPlayer added')
      dispatchAppUpdate({ action: 'addYTplayer', ytplayer: event.target })
      appState.socket?.emit('clientEnteredTVArea');
  }}
  onError={(event) => {
    console.log(event.data);
  }}
  onEnd={(event) => {
    console.log('end');
    appState.socket?.emit('clientVideoEnded');
  }}
  onStateChange={(event) => {
      // Andrew - this might be useful to add something here in the future, but it's not doing anything now
  }}/>}; */

function App(props: { setOnDisconnect: Dispatch<SetStateAction<Callback | undefined>> }) {
  const [appState, dispatchAppUpdate] = useReducer(appStateReducer, defaultAppState());

  const setupGameController = useCallback(async (initData: TownJoinResponse) => {
    await GameController(initData, dispatchAppUpdate);
    return true;
  }, [dispatchAppUpdate]);
  const videoInstance = Video.instance();

  const { setOnDisconnect } = props;
  useEffect(() => {
    setOnDisconnect(() => async () => { // Here's a great gotcha: https://medium.com/swlh/how-to-store-a-function-with-the-usestate-hook-in-react-8a88dd4eede1
      dispatchAppUpdate({ action: 'disconnect' });
      return Video.teardown();
    });
  }, [dispatchAppUpdate, setOnDisconnect]);

  const page = useMemo(() => {
    if (!appState.sessionToken) {
      return <Login doLogin={setupGameController} />;
    } if (!videoInstance) {
      return <div>Loading...</div>;
    }

    // Andrew - I changed the layout of the HTML so that the youtube player is normall in the upper right of page.
    // Also, appState.showYTPlayer is the boolean that controls whether <YTplayer/> is rendered or not

    /* { appState.showYTPlayer ? <YTplayer 
      appState={appState}
      dispatchAppUpdate={dispatchAppUpdate}
/> : null } */

    return (
      <div>
        <div style={{width: "100%;"}}>
          <div style={{width: "50%;", float: "left"}}>
            <WorldMap /> 
            <VideoOverlay preferredMode="fullwidth" />
          </div>
      </div>
      </div>
    );
  }, [setupGameController, appState.sessionToken, videoInstance]);

  const page2 = useMemo(() => {
    return (
          <div style={{marginLeft: "50%;"}}> 
              { appState.showYTPlayer ?  <YoutubeWidget appState={appState}
          dispatchAppUpdate={dispatchAppUpdate} /> : null }
        </div>
    );
  }, [appState.showYTPlayer, appState.mostRecentVideoSync]);

  return (

    <CoveyAppContext.Provider value={appState}>
      <VideoContext.Provider value={Video.instance()}>
        <NearbyPlayersContext.Provider value={appState.nearbyPlayers}>
          {page}
          {page2}
        </NearbyPlayersContext.Provider>
      </VideoContext.Provider>
    </CoveyAppContext.Provider>

  );
}

function EmbeddedTwilioAppWrapper() {
  const { error, setError } = useAppState();
  const [onDisconnect, setOnDisconnect] = useState<Callback | undefined>();
  const connectionOptions = useConnectionOptions();
  return (
    <UnsupportedBrowserWarning>
      <VideoProvider options={connectionOptions} onError={setError} onDisconnect={onDisconnect}>
        <ErrorDialog dismissError={() => setError(null)} error={error} />
        <App setOnDisconnect={setOnDisconnect} />
      </VideoProvider>
    </UnsupportedBrowserWarning>
  );
}

export default function AppStateWrapper(): JSX.Element {
  return (
    <BrowserRouter>
      <ChakraProvider>
        <MuiThemeProvider theme={theme('rgb(185, 37, 0)')}>
          <AppStateProvider preferredMode="fullwidth" highlightedProfiles={[]}>
            <EmbeddedTwilioAppWrapper />
          </AppStateProvider>
        </MuiThemeProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
}
/* eslint-enable */