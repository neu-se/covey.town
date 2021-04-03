import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Participant from '../Participant/Participant';
import useMainParticipant from '../../hooks/useMainParticipant/useMainParticipant';
import useParticipants, { ParticipantWithSlot } from '../../hooks/useParticipants/useParticipants';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';
import useScreenShareParticipant from '../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import { UserProfile } from '../../../../../CoveyTypes';
import Popup from '../../../../Popup/Popup';

import useNearbyPlayers from '../../../../../hooks/useNearbyPlayers';

function useStyles(width: 'sidebar' | 'fullwidth') {
  return makeStyles((theme: Theme) => createStyles({
    container: {
      padding: '2em',
      overflowY: 'auto',
      background: 'rgb(79, 83, 85)',
      gridArea: '1 / 2 / 1 / 3',
      zIndex: 5,
      [theme.breakpoints.down('sm')]: {
        gridArea: '2 / 1 / 3 / 3',
        overflowY: 'initial',
        overflowX: 'auto',
        display: 'flex',
        padding: '8px',
      },
    },
    transparentBackground: {
      background: 'transparent',
    },
    scrollContainer: {
      [theme.breakpoints.down('sm')]: {
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
      display: 'grid',
      gridTemplateColumns: width === 'sidebar' ? '1fr' : '1fr 1fr 1fr 1fr',
      gridAutoRows: '1fr',
      [theme.breakpoints.down('md')]: {
        gridTemplateColumns: width === 'sidebar' ? '1fr' : '1fr 1fr 1fr',
      },
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: width === 'sidebar' ? '1fr' : '1fr 1fr',
      },
      [theme.breakpoints.down('xs')]: {
        gridTemplateColumns: '1fr',
      },
    },
  }))();
}

export default function ParticipantList(props: { gridView: boolean }) {
  const {
    room: { localParticipant },
  } = useVideoContext();
  const participants = useParticipants();
  const [selectedParticipant, setSelectedParticipant] = useSelectedParticipant();
  const screenShareParticipant = useScreenShareParticipant();
  const mainParticipant = useMainParticipant();
  const { nearbyPlayers } = useNearbyPlayers();

  // const { preferredMode, highlightedProfiles } = useAppState();
  // const classes = useStyles(preferredMode);

  const classes = useStyles('fullwidth');

  function participantSorter(x: ParticipantWithSlot, y: ParticipantWithSlot): number {
    return x.slot < y.slot ? -1 : x.slot === y.slot ? 0 : 1;
  }

  const participantsEl = (
    <>
      <Participant
        participant={localParticipant}
        isLocalParticipant
        insideGrid={props.gridView}
                // highlight={highlightedProfiles?.includes(localUserProfile.id) ?? false}
        slot={0}
      />
      {participants
        .filter((p) => nearbyPlayers.find((player) => player.id == p.participant.identity))
        .sort(participantSorter).map((participantWithSlot) => {
          const { participant } = participantWithSlot;
          const isSelected = participant === selectedParticipant;
          const hideParticipant = participant === mainParticipant
                    && participant !== screenShareParticipant
                    && !isSelected
                    && participants.length > 1;
          const player = nearbyPlayers.find((p) => p.id == participantWithSlot.participant.identity);
          const remoteProfile = { displayName: player ? player.userName : 'unknown', id: participantWithSlot.participant.identity };
          return (
            <Participant
              key={participant.sid}
                        // highlight={highlightedProfiles?.includes(participant.identity) ?? false}
              participant={participant}
              profile={remoteProfile}
              isSelected={participant === selectedParticipant}
              // show modal here? 
              onClick={() => {setSelectedParticipant(participant)}}
              hideParticipant={hideParticipant}
              slot={participantWithSlot.slot}
              insideGrid={props.gridView}
            />
          );
        })}
    </>
  );

  return props.gridView ? (
    <main
      className={clsx(
        classes.gridContainer,
        {
          [classes.transparentBackground]: true,
        },
        'participants-grid-container',
        {
          // "single-column": preferredMode === "sidebar" && props.gridView,
          'single-column': false,
        },
      )}
    >
      <div className={classes.gridInnerContainer}>{participantsEl}</div>
    </main>
  ) : (
    <aside
      className={clsx(classes.container, {
        [classes.transparentBackground]: true,
      })}
    >
      <div className={classes.scrollContainer}>{participantsEl}</div>
    </aside>
  );
}
