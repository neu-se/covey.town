import { useAuth0 } from '@auth0/auth0-react';
import { Button, Checkbox, FormControl, FormLabel, Text, useToast } from '@chakra-ui/react';
import { Grid, Hidden, makeStyles, Theme } from '@material-ui/core';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserInfo } from '../../../../../../CoveyTypes';
import useCoveyAppState from '../../../../../../hooks/useCoveyAppState';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../../state';
import ToggleAudioButton from '../../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleVideoButton from '../../Buttons/ToggleVideoButton/ToggleVideoButton';
import LocalVideoPreview from './LocalVideoPreview/LocalVideoPreview';
import SettingsMenu from './SettingsMenu/SettingsMenu';

const useStyles = makeStyles((theme: Theme) => ({
  gutterBottom: {
    marginBottom: '1em',
  },
  marginTop: {
    marginTop: '1em',
  },
  deviceButton: {
    'color': 'black',
    'width': '100%',
    'border': '2px solid #aaa',
    'margin': '1em 0',
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
      'flexDirection': 'column-reverse',
      'width': '100%',
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
  mobileSavedMedia: {
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
  savedAudioPreference: boolean;
  savedVideoPreference: boolean;
  setUserInfo?(userInfo: UserInfo): void;
  setMediaError?(error: Error): void;
}

export default function DeviceSelectionScreen({
  savedAudioPreference,
  savedVideoPreference,
  setUserInfo,
  setMediaError,
}: DeviceSelectionScreenProps) {
  const classes = useStyles();
  const [useSavedDevicePreferences, setUseSavedDevicePreferences] = useState<boolean>(false);
  const [currentlyUnmuted, setCurrentlyUnmuted] = useState<boolean>(false);
  const [currentlyShowVideo, setCurrentlyShowVideo] = useState<boolean>(false);
  const { apiClient } = useCoveyAppState();
  const auth0 = useAuth0();

  const { getToken, isFetching } = useAppState();
  const {
    connect,
    isAcquiringLocalTracks,
    isConnecting,
    localAudioTrack,
    localVideoTrack,
  } = useVideoContext();
  const disableButtons = isFetching || isAcquiringLocalTracks || isConnecting;
  const { handleSubmit, errors, register, formState } = useForm();

  const toast = useToast();
  const handleSaveDevices = async (userID: string, newUseAudio: boolean, newUseVideo: boolean) => {
    try {
      await apiClient.saveUser({ userID, useAudio: newUseAudio, useVideo: newUseVideo });
      const getResponse = await apiClient.getUser({ userID });
      if (setUserInfo) {
        setUserInfo(getResponse as UserInfo);
      }
      toast({
        title: 'Successfully saved device settings!',
        description:
          "Any time you log into Covey.Town in the future, you can click the 'Saved Media' button to apply these settings.",
        status: 'success',
      });
    } catch (err) {
      toast({
        title: 'Unable to connect to Account Service',
        description: err.toString(),
        status: 'error',
      });
    }
  };

  return (
    <>
      <Grid container justify='center' aria-label='join video room form'>
        <Grid item md={7} sm={12} xs={12}>
          <div className={classes.localPreviewContainer}>
            <LocalVideoPreview identity='' />
          </div>
          <div className={classes.mobileButtonBar}>
            <Hidden mdUp>
              <ToggleAudioButton
                className={classes.mobileButton}
                disabled={useSavedDevicePreferences || disableButtons}
                setMediaError={setMediaError}
                useSavedAudio={useSavedDevicePreferences ? savedAudioPreference : undefined} // only want to pass down when checked
                setUnmuted={setCurrentlyUnmuted}
              />
              <ToggleVideoButton
                className={classes.mobileButton}
                disabled={useSavedDevicePreferences || disableButtons}
                setMediaError={setMediaError}
                useSavedVideo={useSavedDevicePreferences ? savedVideoPreference : undefined}
                setShowVideo={setCurrentlyShowVideo}
              />
              {auth0.isAuthenticated && (
                <>
                  <Text className={classes.mobileSavedMedia} fontSize='sm'>
                    Saved Media
                  </Text>
                  <Checkbox
                    id='savedDevicePreferences'
                    name='savedDevicePreferences'
                    isChecked={useSavedDevicePreferences}
                    onChange={e => {
                      setUseSavedDevicePreferences(e.target.checked);
                    }}
                  />
                  <Button
                    float='right'
                    isDisabled={useSavedDevicePreferences}
                    onClick={async () => {
                      await handleSaveDevices(auth0.user.sub, currentlyUnmuted, currentlyShowVideo);
                    }}>
                    Save
                  </Button>
                </>
              )}
            </Hidden>
            <SettingsMenu mobileButtonClass={classes.mobileButton} />
          </div>
        </Grid>
        <Grid item md={5} sm={12} xs={12}>
          <Grid container direction='column' justify='space-between' style={{ height: '100%' }}>
            <div>
              <Hidden smDown>
                <ToggleAudioButton
                  className={classes.deviceButton}
                  disabled={useSavedDevicePreferences || disableButtons}
                  setMediaError={setMediaError}
                  useSavedAudio={useSavedDevicePreferences ? savedAudioPreference : undefined}
                  setUnmuted={setCurrentlyUnmuted}
                />
                <ToggleVideoButton
                  className={classes.deviceButton}
                  disabled={useSavedDevicePreferences || disableButtons}
                  setMediaError={setMediaError}
                  useSavedVideo={useSavedDevicePreferences ? savedVideoPreference : undefined}
                  setShowVideo={setCurrentlyShowVideo}
                />
                {auth0.isAuthenticated && (
                  <>
                    <FormControl>
                      <FormLabel whiteSpace='nowrap' htmlFor='savedDevicePreferences'>
                        Saved Media
                      </FormLabel>
                      <Checkbox
                        id='savedDevicePreferences'
                        name='savedDevicePreferences'
                        isChecked={useSavedDevicePreferences}
                        onChange={e => {
                          setUseSavedDevicePreferences(e.target.checked);
                        }}
                      />
                    </FormControl>
                    <Button
                      float='right'
                      isDisabled={useSavedDevicePreferences}
                      onClick={async () => {
                        await handleSaveDevices(
                          auth0.user.sub,
                          currentlyUnmuted,
                          currentlyShowVideo,
                        );
                      }}>
                      Save
                    </Button>
                  </>
                )}
              </Hidden>
            </div>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
