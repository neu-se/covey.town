import React, { useEffect, useState } from 'react';
import { Box, Button, ChakraProvider, FormControl, FormHelperText, FormLabel, Input, Stack, Table, Tbody, Td, Th, Thead, Tr, Radio, Heading, useToast, useForceUpdate, HStack } from '@chakra-ui/react';
import useCoveyAppState from '../../hooks/useCoveyAppState';

type YTVideo = {
    url: string;
    title: string;
    channel: string;
    duration: string;
}

export default function VideoListWidget(): JSX.Element {
    // Andrew - use hook so Widget only renders when near TV and also so that we have access to socket to emit messages
    const {
        showYTPlayer, socket
    } = useCoveyAppState();

  const toast = useToast();
  const forceUpdate = useForceUpdate();
  const [newVideoURL, setNewVideoURL] = useState('');
  // const [radioButtonState, setRadioButtonState] = useState(videoList.length > 0 ? videoList[0].url : '');
  const [ytVideos, setYTVideos] = useState<YTVideo[]>([]);
  const [voteVideoURL, setVoteVideoURL] = useState<string>('')
  const [radioButtonState, setRadioButtonState] = useState(''); // Andrew - changed to ytVideos instead of global videoList
  const [votingButtonDisabled, setVotingButtonDisabled] = useState<boolean>(false);

  const listVideos = () => ytVideos.map(video => (
      <Tr key={video.url}>
        <Td role='cell'>{video.title}</Td>
        <Td role='cell'>{video.channel}</Td>
        <Td role='cell'>{video.duration}</Td>
        <Td >
          <Radio value={video.url} isChecked={radioButtonState === video.url} 
            onChange={() => {setRadioButtonState(video.url); setVoteVideoURL(video.url);}} // Andrew - changed from:   voteVideoURL=video.url;}}
          >
            Play Next
          </Radio>
        </Td>
      </Tr>
  ));

  // Andrew - set up sockets to receive messages from server
  useEffect(() => {
    socket?.on('nextVideoOptions', (nextVideoOptions: YTVideo[]) => {
        console.log('Received URL options to display and maybe vote on');
        setYTVideos(nextVideoOptions);
        // handleForceUpdate(); // No force updates appear necessary
    });
    socket?.on('enableVotingButton', () => {
        console.log('Client should enable voting button now');
        setVotingButtonDisabled(false);
    });
    socket?.on('resetVideoOptions', () => {
        console.log('resetVideoOptions');
        setYTVideos([]);
    });
  },[socket]); // handleAddNewURL, handleForceUpdate]);

  // Joe - for new url submission. Check if URL is valid. If not say not added, if yes add it. Need to get youtube title, channel, duration using youtube api
  // Andrew - Only display if showYTPlayer is true (when player is by TV)
  return (
    <> { showYTPlayer ? 
      <form>
        <Stack>
            <HStack spacing="500px">
            <Heading p="5" as="h5" size="md">Select a video to watch</Heading>
            <Button colorScheme="blue" disabled={votingButtonDisabled} onClick={() => {
                socket?.emit('clientVoted', radioButtonState);
                setVotingButtonDisabled(true);
            }}>Submit Your Only Vote For Next Video</Button>
            </HStack>
          <Box maxH="400px" overflowY="scroll" borderWidth="1px" borderRadius="lg">
            <Table>
              <Thead><Tr><Th>Video Title</Th><Th>Creator</Th><Th>Duration</Th><Th>Vote on next video</Th></Tr></Thead>
                <Tbody>
                  {listVideos()}
                </Tbody>
            </Table>
          </Box>

          <FormControl id="email">
            <FormLabel p="5" as="h5" size="md">Submit new video to you would like to watch</FormLabel>
            <Input name="newVideo" placeholder="Youtube URL" onChange={event => setNewVideoURL(event.target.value)}/>
            <FormHelperText>Please enter in the Youtube URL.</FormHelperText>
          </FormControl>
          <Button colorScheme="blue" 
            onClick={() => {
                // should send the URL to the server to check if it is valid
                socket?.emit('clientProposedNewURL', newVideoURL);
                // Andrew - the re-rendering is handled when the socket receives the URL from the server if it's valid
            }}
          >
            Submit New Video
          </Button>
        </Stack>
      </form>
    : null } </>
  );
} // <Input name="newVideo" placeholder="Youtube URL" value={newVideoURL} onChange={event => setNewVideoURL(event.target.value)}/> // ANDREW - TODO ASK JOE IF IT IS NECESSARY TO HAVE value={newVideoURL}

// let voteVideoURL = videoList.length > 0 ? videoList[0].url : '';

  // Forces a render
  // const handleForceUpdate = React.useCallback(() => {
  //   forceUpdate();
  // }, [forceUpdate]);

  // function addVideoToVideoList(inputURL: string) {
    // Figure out YOUTUBE DATA API to take in URL and get the details to fill in list: title, channel name, duration
    // Once that is successful, add to video list; else throw error
    // This should probably be in the backend along with teh YoutubeVids.tsx

    // try {
    //   // Get details for YouTube DATA API. for now filled with placeholders
    //   const API_KEY = process.env.YT_API_key;
    //   const key = JSON.stringify(API_KEY);
    //   const api = new YoutubeDataAPI(key);

    //   const videoid = inputURL.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
    //   const videoID = JSON.stringify(videoid);
    //   console.log(videoID)
    //   if(videoid != null) {
    //     const reponse = api.searchVideo(videoID)
    //     console.log(reponse);

    //   } else { 
    //     throw new Error(`Invalid URL`)
    
  //   try {
  //     // Get details for YouTube DATA API. for now filled with placeholders
  //     const newVideo: YTVideo = {url: inputURL, title: "NEW TITLE", channel: "NEW CHANNEL", duration: "TIME"};
  //     videoList.push(newVideo);
  //   } catch (err) {
  //     throw new Error(`Error processing request for submitted URL`)
  //   }
  // };

  // We might need to use this as a useCallback instead of a normal function as seen below in the commented code
  // const handleAddNewURL = React.useCallback(() => {
  //     try {
  //     if (!newVideoURL || newVideoURL.length === 0) {
  //       toast({
  //         title: 'Unable to submit video suggestion',
  //         description: 'Please enter a valid Youtube URL',
  //         status: 'error',
  //       });
  //       return;
  //     }
  //     // addVideoToVideoList(newVideoURL);
  //     toast({
  //       title: `New video is added to the video collection!`,
  //       status: 'success',
  //       isClosable: true,
  //       duration: 3000,
  //     })
  //   } catch (err) {
  //     toast({
  //       title: 'Unable to add URL to video collection.',
  //       description: err.toString(),
  //       status: 'error'
  //     })
  //   }
  // }, [newVideoURL, toast]);

//   const handleAddNewURL = () => {
//     try {
//       if (!newVideoURL || newVideoURL.length === 0) {
//         toast({
//           title: 'Unable to submit video suggestion',
//           description: 'Please enter a valid Youtube URL',
//           status: 'error',
//         });
//         return;
//       }
//       addVideoToVideoList(newVideoURL);
//       toast({
//         title: `New video is added to the video collection!`,
//         status: 'success',
//         isClosable: true,
//         duration: 3000,
//       })
//     } catch (err) {
//       toast({
//         title: 'Unable to add URL to video collection.',
//         description: err.toString(),
//         status: 'error'
//       })
//     }
//   };

  // Andrew - the server should tell the widget what video URLs to display and when to update them.
  // useEffect(() => {
  //   const getVideoList = () => {
  //     setYTVideos(getVideos()); // getVideo is the getter to get youtube videos list. function in import
  //   }
  //   getVideoList();
  //   const timeout = setTimeout(() => getVideoList(), 2000);
  //   return () => {
  //     clearTimeout(timeout);
  //   };
  // }, []);