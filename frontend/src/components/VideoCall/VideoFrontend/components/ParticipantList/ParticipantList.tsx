import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import { usePlayersInVideoCall } from '../../../../../classes/TownController';
import TicTacToeAreaWrapper from '../../../../Town/interactables/TicTacToe/TicTacToeArea';
import ViewingAreaVideo from '../../../../Town/interactables/ViewingAreaVideo';
import useMainParticipant from '../../hooks/useMainParticipant/useMainParticipant';
import useParticipants, { ParticipantWithSlot } from '../../hooks/useParticipants/useParticipants';
import useScreenShareParticipant from '../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import Participant from '../Participant/Participant';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      overflowY: 'auto',
      background: 'rgb(79, 83, 85)',
      gridArea: '1 / 2 / 1 / 3',
      zIndex: 5,
      [theme.breakpoints.down('sm')]: {
        gridArea: '2 / 1 / 3 / 3',
        overflowY: 'initial',
        overflowX: 'auto',
        display: 'flex',
      },
    },
    transparentBackground: {
      background: 'transparent',
    },
    scrollContainer: {
      display: 'flex',
      justifyContent: 'center',
    },
    innerScrollContainer: {
      width: `calc(${theme.sidebarWidth}px - 3em)`,
      padding: '1.5em 0',
      [theme.breakpoints.down('sm')]: {
        width: 'auto',
        padding: `${theme.sidebarMobilePadding}px`,
        display: 'flex',
      },
    },
    gridContainer: {
      gridArea: '1 / 1 / 1 / 3',
      overflowX: 'hidden',
      overflowY: 'auto',
      [theme.breakpoints.down('sm')]: {
        gridArea: '1 / 1 / 3 / 1',
      },
    },
    gridInnerContainer: {
      // display: 'flex',
      // gridTemplateColumns: '1fr 1fr 1fr 1fr',
      // gridAutoRows: '1fr',
      // [theme.breakpoints.down('md')]: {
      //   gridTemplateColumns: '1fr 1fr 1fr',
      // },
      // [theme.breakpoints.down('sm')]: {
      //   gridTemplateColumns: '1fr 1fr',
      // },
      // [theme.breakpoints.down('xs')]: {
      //   gridTemplateColumns: '1fr',
      // },
      width: '100%',
      justifyContent: 'center',
      alignContent: 'center',
    },
  }),
);

export default function ParticipantList() {
  // const classes = useStyles();
  const { room } = useVideoContext();
  const localParticipant = room!.localParticipant;
  const participants = useParticipants();
  const [selectedParticipant, setSelectedParticipant] = useSelectedParticipant();
  const screenShareParticipant = useScreenShareParticipant();
  const mainParticipant = useMainParticipant();
  const nearbyPlayers = usePlayersInVideoCall();
  const isRemoteParticipantScreenSharing =
    screenShareParticipant && screenShareParticipant !== localParticipant;

  const classes = useStyles('fullwidth');
  // if (participants.length === 0) return null; // Don't render this component if there are no remote participants.

  // return (
  //   <aside
  //     className={clsx(classes.container, {
  //       [classes.transparentBackground]: !isRemoteParticipantScreenSharing,
  //     })}
  //   >
  //     <div className={classes.scrollContainer}>
  //       <div className={classes.innerScrollContainer}>
  //         <Participant participant={localParticipant} isLocalParticipant={true} />
  //         {participants.map(participant => {
  //           const isSelected = participant === selectedParticipant;
  //           const hideParticipant =
  //             participant === mainParticipant && participant !== screenShareParticipant && !isSelected;
  //           return (
  //             <Participant
  //               key={participant.sid}
  //               participant={participant}
  //               isSelected={participant === selectedParticipant}
  //               onClick={() => setSelectedParticipant(participant)}
  //               hideParticipant={hideParticipant}
  //             />
  //           );
  //         })}
  //       </div>
  //     </div>
  //   </aside>
  // );

  function participantSorter(x: ParticipantWithSlot, y: ParticipantWithSlot): number {
    return x.slot < y.slot ? -1 : x.slot === y.slot ? 0 : 1;
  }

  const participantsEl = (
    <>
      <Participant
        participant={localParticipant}
        isLocalParticipant
        insideGrid={true}
        // highlight={highlightedProfiles?.includes(localUserProfile.id) ?? false}
        slot={0}
      />
      <ViewingAreaVideo />

      {participants
        .filter(p => nearbyPlayers.find(player => player.id == p.participant.identity))
        .sort(participantSorter)
        .map(participantWithSlot => {
          const { participant } = participantWithSlot;
          const isSelected = participant === selectedParticipant;
          const hideParticipant =
            participant === mainParticipant &&
            participant !== screenShareParticipant &&
            !isSelected &&
            participants.length > 1;
          const player = nearbyPlayers.find(p => p.id == participantWithSlot.participant.identity);
          const remoteProfile = {
            displayName: player ? player.userName : 'unknown',
            id: participantWithSlot.participant.identity,
          };
          return (
            <Participant
              key={participant.sid}
              // highlight={highlightedProfiles?.includes(participant.identity) ?? false}
              participant={participant}
              profile={remoteProfile}
              isSelected={participant === selectedParticipant}
              onClick={() => setSelectedParticipant(participant)}
              hideParticipant={hideParticipant}
              slot={participantWithSlot.slot}
              insideGrid={false}
            />
          );
        })}
    </>
  );

  return (
    <main
    // className={clsx(
    //   classes.gridContainer,
    //   {
    //     [classes.transparentBackground]: true,
    //   },
    //   'participants-grid-container',
    //   {
    //     // "single-column": preferredMode === "sidebar" && props.gridView,
    //     'single-column': false,
    //   },
    // )}
    >
      <div className={classes.gridInnerContainer}>{participantsEl}</div>
    </main>
  );
}
