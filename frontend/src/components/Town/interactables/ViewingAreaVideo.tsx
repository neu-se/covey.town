import { Container } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import ViewingAreaController from '../../../classes/interactable/ViewingAreaController';
import useTownController from '../../../hooks/useTownController';
import SelectVideoModal from './SelectVideoModal';
import ViewingAreaInteractable from './ViewingArea';

const ALLOWED_DRIFT = 3;
export class MockReactPlayer extends ReactPlayer {
  render(): React.ReactNode {
    return <></>;
  }
}

/**
 * The ViewingAreaVideo component renders a ViewingArea's video, using the ReactPlayer component.
 * The URL property of the ReactPlayer is set to the ViewingAreaController's video property, and the isPlaying
 * property is set, by default, to the controller's isPlaying property.
 *
 * The ViewingAreaVideo subscribes to the ViewingAreaController's events, and responds to
 * playbackChange events by pausing (or resuming) the video playback as appropriate. In response to
 * progressChange events, the ViewingAreaVideo component will seek the video playback to the same timecode.
 * To avoid jittering, the playback is allowed to drift by up to ALLOWED_DRIFT before seeking: the video should
 * not be seek'ed to the newTime from a progressChange event unless the difference between the current time of
 * the video playback exceeds ALLOWED_DRIFT.
 *
 * The ViewingAreaVideo also subscribes to onProgress, onPause, onPlay, and onEnded events of the ReactPlayer.
 * In response to these events, the ViewingAreaVideo updates the ViewingAreaController's properties, and
 * uses the TownController to emit a viewing area update.
 *
 * @param props: A single property 'controller', which is the ViewingAreaController corresponding to the
 *               current viewing area.
 */
export function ViewingAreaVideo({
  controller,
}: {
  controller: ViewingAreaController;
}): JSX.Element {
  const [isPlaying, setPlaying] = useState<boolean>(controller.isPlaying);
  const townController = useTownController();

  const reactPlayerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    const progressListener = (newTime: number) => {
      const currentTime = reactPlayerRef.current?.getCurrentTime();
      if (currentTime !== undefined && Math.abs(currentTime - newTime) > ALLOWED_DRIFT) {
        reactPlayerRef.current?.seekTo(newTime, 'seconds');
      }
    };
    controller.addListener('progressChange', progressListener);
    controller.addListener('playbackChange', setPlaying);
    return () => {
      controller.removeListener('playbackChange', setPlaying);
      controller.removeListener('progressChange', progressListener);
    };
  }, [controller]);

  return (
    <Container className='participant-wrapper'>
      Viewing Area: {controller.id}
      <ReactPlayer
        url={controller.video}
        ref={reactPlayerRef}
        config={{
          youtube: {
            playerVars: {
              // disable skipping time via keyboard to avoid weirdness with chat, etc
              disablekb: 1,
              autoplay: 1,
              // modestbranding: 1,
            },
          },
        }}
        playing={isPlaying}
        onProgress={state => {
          if (state.playedSeconds != 0 && state.playedSeconds != controller.elapsedTimeSec) {
            controller.elapsedTimeSec = state.playedSeconds;
            townController.emitViewingAreaUpdate(controller);
          }
        }}
        onPlay={() => {
          if (!controller.isPlaying) {
            controller.isPlaying = true;
            townController.emitViewingAreaUpdate(controller);
          }
        }}
        onPause={() => {
          if (controller.isPlaying) {
            controller.isPlaying = false;
            townController.emitViewingAreaUpdate(controller);
          }
        }}
        onEnded={() => {
          if (controller.isPlaying) {
            controller.isPlaying = false;
            townController.emitViewingAreaUpdate(controller);
          }
        }}
        controls={true}
        width='100%'
        height='100%'
      />
    </Container>
  );
}

/**
 * The ViewingArea monitors the player's interaction with a ViewingArea on the map: displaying either
 * a popup to set the video for a viewing area, or if the video is set, a video player.
 *
 * @param props: the viewing area interactable that is being interacted with
 */
export function ViewingArea({
  viewingArea,
}: {
  viewingArea: ViewingAreaInteractable;
}): JSX.Element {
  const townController = useTownController();
  const viewingAreaController = useInteractableAreaController<ViewingAreaController>(
    viewingArea.name,
  );
  const [selectIsOpen, setSelectIsOpen] = useState(viewingAreaController.video === undefined);
  const [viewingAreaVideoURL, setViewingAreaVideoURL] = useState(viewingAreaController.video);
  useEffect(() => {
    const setURL = (url: string | undefined) => {
      if (!url) {
        townController.interactableEmitter.emit('endIteraction', viewingAreaController);
      } else {
        setViewingAreaVideoURL(url);
      }
    };
    viewingAreaController.addListener('videoChange', setURL);
    return () => {
      viewingAreaController.removeListener('videoChange', setURL);
    };
  }, [viewingAreaController, townController]);

  if (!viewingAreaVideoURL) {
    return (
      <SelectVideoModal
        isOpen={selectIsOpen}
        close={() => {
          setSelectIsOpen(false);
          // forces game to emit "viewingArea" event again so that
          // repoening the modal works as expected
          townController.interactEnd(viewingArea);
        }}
        viewingArea={viewingArea}
      />
    );
  }
  return (
    <>
      <ViewingAreaVideo controller={viewingAreaController} />
    </>
  );
}

/**
 * The ViewingAreaWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a viewing area.
 */
export default function ViewingAreaWrapper(): JSX.Element {
  const viewingArea = useInteractable<ViewingAreaInteractable>('viewingArea');
  if (viewingArea) {
    return <ViewingArea viewingArea={viewingArea} />;
  }
  return <></>;
}
