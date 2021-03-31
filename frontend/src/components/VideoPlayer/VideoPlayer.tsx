import React, { useEffect, useState, useRef } from 'react';
import YouTube from 'react-youtube';
import { YouTubePlayer } from 'youtube-player/dist/types'; 
import { YoutubeVideoInfo } from '../../CoveyTypes';
import useCoveyAppState from '../../hooks/useCoveyAppState';

const { log } = console;

export default function VideoPlayer(): JSX.Element {
  const {
    showYTPlayer, socket
  } = useCoveyAppState();

  const playerRef = useRef<any>();

//   const [ytPlayer, setytPlayer] = useState<YouTubePlayer>();

  useEffect(() => {
    // socket?.emit('clientEnteredTVArea');
    // Andrew - listens for server saying someone paused video
    socket?.on('playerPaused', () => {
        playerRef.current.internalPlayer.pauseVideo();
    });
    // Andrew - listens for server saying someone played video
    socket?.on('playerPlayed', () => {
        playerRef.current.internalPlayer.playVideo();
    });
    // Andrew - listens for server telling client to load a certain video at certain timestamp
    socket?.on('videoSynchronization', (currentVideoInfo: YoutubeVideoInfo) => {
        console.log('in vidSync here');
        const vidID = currentVideoInfo.url.split('=')[currentVideoInfo.url.split('=').length - 1];
        playerRef.current.internalPlayer.loadVideoById(vidID, currentVideoInfo.timestamp);
    });
  },[socket]);

  // return (<div>
  //     { showYTPlayer ? <div> <YouTube
  //       ref={playerRef}
  //       opts={{height: '200', width: '400', playerVars: {enablejsapi: 1, controls: 1}}}
  //       onPause={(event) => {
  //       //   socket?.emit('clientPaused');
  //       }}
  //       onPlay={(event) => {
  //       //   socket?.emit('clientPlayed');
  //       }} 
  //       onReady={(event) => {
  //           log('player is ready')
  //       }}
  //       onError={(event) => {
  //         console.log('Error:', event.data);
  //       }}
  //       onEnd={(event) => {
  //         socket?.emit('clientVideoEnded');
  //       }}
  //       onStateChange={(event) => {
  //           // Andrew - this might be useful to add something here in the future, but it's not doing anything now
  //       }}/>
  //       <button type="submit" onClick={() => socket?.emit('clientPlayed')}>Play___</button>
  //       <button type="submit" onClick={() => socket?.emit('clientPaused')}>Pause___</button>
  //       <button type="submit" onClick={() => socket?.emit('clientEnteredTVArea')}>Sync up</button>
  //       </div>
  //        : null}
  //   </div>)
  
  return (<div>
    { showYTPlayer ? <div> <div style={{position: 'absolute', zIndex: 300000, height: '200px', width: '400px'}}> </div> <div> <YouTube
      ref={playerRef}
      opts={{height: '200', width: '400', playerVars: {enablejsapi: 1, controls: 0}}}
      onPause={(event) => {
      //   socket?.emit('clientPaused');
      }}
      onPlay={(event) => {
      //   socket?.emit('clientPlayed');
      }} 
      onReady={(event) => {
          log('player is ready')
      }}
      onError={(event) => {
        console.log('Error:', event.data);
      }}
      onEnd={(event) => {
        socket?.emit('clientVideoEnded');
      }}
      onStateChange={(event) => {
          // Andrew - this might be useful to add something here in the future, but it's not doing anything now
      }}/> </div>
      <div>
      <button type="submit" onClick={() => socket?.emit('clientPlayed')}>Play___</button>
      <button type="submit" onClick={() => socket?.emit('clientPaused')}>Pause___</button>
      <button type="submit" onClick={() => socket?.emit('clientEnteredTVArea')}>Sync up</button>
      </div>
      </div>
       : null}
  </div>)

}