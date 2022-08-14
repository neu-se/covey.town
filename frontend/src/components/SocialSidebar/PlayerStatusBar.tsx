import React, { useState } from 'react';
import { Tooltip } from '@chakra-ui/react';
import Switch from '@material-ui/core/Switch';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Player, { PlayerStatus, ServerPlayer } from '../../classes/Player';
import useCoveyAppState from '../../hooks/useCoveyAppState';

type PlayerStatusProps = {
  player: Player;
};

export default function PlayerStatusBar({ player }: PlayerStatusProps): JSX.Element {
  const { socket, myPlayerID } = useCoveyAppState();
  const [isPlayerFree, setPlayerFree] = useState(player.status === 'free');

  if (socket) {
    socket.on('playerStatusChanged', (statusChangedPlayer: ServerPlayer) => {
      if (player.id === statusChangedPlayer._id) {
        setPlayerFree(statusChangedPlayer.status === 'free');
      }
    });
  }

  const renderPlayerStatusCircle = () => (
    <Tooltip label={isPlayerFree ? 'free' : 'busy'}>
      <span
        style={{
          display: 'inline-block',
          borderRadius: '50%',
          borderStyle: 'solid',
          height: '15px',
          width: '15px',
          backgroundColor: isPlayerFree ? 'green' : 'darkgray',
          marginLeft: '10px',
          marginBottom: '-2px',
        }}
      />
    </Tooltip>
  );

  const onSwitchChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setPlayerFree(checked);
    const playerStatus: PlayerStatus = checked ? 'free' : 'busy';
    if (socket) {
      socket.emit('playerStatusChanged', playerStatus);
    }
  };

  const renderPlayerStatusSwitch = () => (
    <Typography component='div' style={{ display: 'inline-block', marginLeft: '10px' }}>
      <Grid component='label' container alignItems='center' spacing={0}>
        <Grid item>busy</Grid>
        <Grid item>
          <Switch
            defaultChecked
            onChange={onSwitchChange}
            color='primary'
            name='playerStatusSwitch'
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
        </Grid>
        <Grid item>free</Grid>
      </Grid>
    </Typography>
  );

  return <>{player.id === myPlayerID ? renderPlayerStatusSwitch() : renderPlayerStatusCircle()}</>;
}

