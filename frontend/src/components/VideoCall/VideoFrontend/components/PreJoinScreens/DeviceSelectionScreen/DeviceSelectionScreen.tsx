import React, { useCallback } from 'react';
import {
  makeStyles, Grid, Theme, Hidden,
} from '@material-ui/core';
import { useForm } from 'react-hook-form';
import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
} from '@chakra-ui/react';
import assert from 'assert';
import LocalVideoPreview from './LocalVideoPreview/LocalVideoPreview';
import SettingsMenu from './SettingsMenu/SettingsMenu';
import ToggleAudioButton from '../../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleVideoButton from '../../Buttons/ToggleVideoButton/ToggleVideoButton';
import { useAppState } from '../../../state';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { VideoRoom } from '../../../../../../CoveyTypes';

import Video, { JoinRoomResponse } from '../../../../../../classes/Video/Video';

const useStyles = makeStyles((theme: Theme) => ({
  gutterBottom: {
    marginBottom: '1em',
  },
  marginTop: {
    marginTop: '1em',
  },
  deviceButton: {
    color: 'black',
    width: '100%',
    border: '2px solid #aaa',
    margin: '1em 0',
    '&:hover': {
      color: 'black',
    },
  },
  localPreviewContainer: {
    paddingRight: '2em',
    [theme.breakpoints.down('sm')]: {
      padding: '0 2.5em',
    },
  },
  joinButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
      width: '100%',
      '& button': {
        margin: '0.5em 0',
      },
    },
  },
  mobileButtonBar: {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: '1.5em 0 1em',
    },
  },
  mobileButton: {
    padding: '0.8em 0',
    margin: 0,
  },
}));

interface DeviceSelectionScreenProps {
  room: VideoRoom;
  setMediaError?(error: Error): void;
  doLogin: (initData: JoinRoomResponse) => Promise<boolean>;
}

export default function DeviceSelectionScreen({ doLogin, room, setMediaError }: DeviceSelectionScreenProps) {
  const classes = useStyles();
  const { getToken, isFetching } = useAppState();
  const {
    connect, isAcquiringLocalTracks, isConnecting, localAudioTrack, localVideoTrack,
  } = useVideoContext();
  const disableButtons = isFetching || isAcquiringLocalTracks || isConnecting;
  const {
    handleSubmit, errors, register, formState,
  } = useForm();

  const handleJoin = useCallback(async (values: { name: string }) => {
    const initData = await Video.setup(values.name);

    const loggedIn = await doLogin(initData);
    if (loggedIn) {
      assert(initData.providerVideoToken);
      await connect(initData.providerVideoToken);
    }
  }, [doLogin, room, localAudioTrack, localVideoTrack]);

  function validateName(value: string) {
    if (!value || value.length == 0) {
      return 'Name is required';
    }
    return true;
  }
  return (
    <>
      <Grid container justify="center" aria-label="join video room form">
        <Grid item md={7} sm={12} xs={12}>
          <div className={classes.localPreviewContainer}>
            <LocalVideoPreview identity="" />
          </div>
          <div className={classes.mobileButtonBar}>
            <Hidden mdUp>
              <ToggleAudioButton
                className={classes.mobileButton}
                disabled={disableButtons}
                setMediaError={setMediaError}
              />
              <ToggleVideoButton
                className={classes.mobileButton}
                disabled={disableButtons}
                setMediaError={setMediaError}
              />
            </Hidden>
            <SettingsMenu mobileButtonClass={classes.mobileButton} />
          </div>
        </Grid>
        <Grid item md={5} sm={12} xs={12}>
          <Grid container direction="column" justify="space-between" style={{ height: '100%' }}>
            <div>
              <Hidden smDown>
                <ToggleAudioButton
                  className={classes.deviceButton}
                  disabled={disableButtons}
                  setMediaError={setMediaError}
                />
                <ToggleVideoButton
                  className={classes.deviceButton}
                  disabled={disableButtons}
                  setMediaError={setMediaError}
                />
              </Hidden>
            </div>
            <form onSubmit={handleSubmit(handleJoin)}>
              <FormControl isInvalid={errors.name}>
                <FormLabel htmlFor="name">Name</FormLabel>
                <Input autoFocus name="name" placeholder="Your name" ref={register({ validate: validateName })} />
                <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
              </FormControl>
              <Button colorScheme="teal" isLoading={formState.isSubmitting} type="submit">Join Room</Button>
            </form>
            <div className={classes.joinButtons} />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
