import React, { useEffect, useState } from 'react';
import { Box, Button, ChakraProvider, FormControl, FormHelperText, FormLabel, Input, Stack, Table, Tbody, Td, Th, Thead, Tr, Radio, Heading, useToast, useForceUpdate, HStack } from '@chakra-ui/react';
import useCoveyAppState from '../../hooks/useCoveyAppState';

type YTVideo = {
    url: string;
    title: string;
    channel: string;
    duration: string;
}

// THIS SHOULD PROBABLY BE IN THE BACKEND

const videoList : YTVideo[] = [];

function getVideos(): YTVideo[] {
    return videoList;
}

const video1 : YTVideo = {
    url: "https://www.youtube.com/watch?v=QtXby3twMmI",
    title: "Coldplay - Adventure Of A Lifetime (Official Video)",
    channel: "Coldplay",
    duration: "5:16",
};
videoList.push(video1);
  
const video2 : YTVideo = {
    url: "https://www.youtube.com/watch?v=YqeW9_5kURI",
    title: "Major Lazer & DJ Snake - Lean On (feat. MØ) (Official Music Video)",
    channel: "Major Lazer",
    duration: "2:59",
};
videoList.push(video2);

const video3 : YTVideo = {
    url: "https://www.youtube.com/watch?v=QtMzV73NAgk",
    title: "PlayStation 5 Unboxing & Accessories!",
    channel: "Marques Brownlee",
    duration: "11:39",
};
videoList.push(video3);

const video4 : YTVideo = {
    url: "https://www.youtube.com/watch?v=QxGVgXf_LNk",
    title: "Going Through The Same Drive Thru 1,000 Times",
    channel: "MrBeast",
    duration: "15:38",
};
videoList.push(video4);

const video5 : YTVideo = {
    url: "https://www.youtube.com/watch?v=Kh3RHV5G1Fc",
    title: "Inside El Chapo’s Escape Tunnel",
    channel: "Vice News",
    duration: "11:19",
};
videoList.push(video5);

const video6 : YTVideo = {
    url: "https://www.youtube.com/watch?v=dllm-HH0toI",
    title: "Barcelona vs. Paris Saint-Germain: Extended Highlights",
    channel: "Champions League on CBS Sports",
    duration: "14:23",
};
videoList.push(video6);

const video7 : YTVideo = {
    url: "https://www.youtube.com/watch?v=cg1rtWXHSKU",
    title: "Captain America vs Ultron - Fight Scene - Avengers: Age of Ultron - Movie CLIP HD",
    channel: "TopMovieClips",
    duration: "3:52",
};
videoList.push(video7);

const video8 : YTVideo = {
    url: "https://www.youtube.com/watch?v=kZZj831VbEM",
    title: "15 Minutes Of Pure Gabriel 'Fluffy' Iglesias Stand-Up",
    channel: "Netflix Is A Joke",
    duration: "14:31",
};
videoList.push(video8);

const video9 : YTVideo = {
    url: "https://www.youtube.com/watch?v=3_9v-7rtVDk",
    title: "Key & Peele Lose Their Minds Eating Spicy Wings | Hot Ones",
    channel: "First We Feast",
    duration: "14:11",
};
videoList.push(video9);

const video10 : YTVideo = {
    url: "https://www.youtube.com/watch?v=KUwAvIOAHx0",
    title: "Inside A $387 Million Penthouse In Monaco",
    channel: "TheRichest",
    duration: "8:43",
};
videoList.push(video10);
  
let voteVideoURL = videoList.length > 0 ? videoList[0].url : '';

export default function VideoListWidget(): JSX.Element {
    // Andrew - use hook so Widget only renders when near TV and also so that we have access to socket to emit messages
    const {
        showYTPlayer, socket
    } = useCoveyAppState();

  const toast = useToast();
  const forceUpdate = useForceUpdate();
  const [radioButtonState, setRadioButtonState] = useState(videoList.length > 0 ? videoList[0].url : '');
  const [newVideoURL, setNewVideoURL] = useState('');
  const [ytVideos, setYTVideos] = useState<YTVideo[]>([]);
  const [votingButtonDisabled, setVotingButtonDisabled] = useState<boolean>(false);

  const listVideos = () => ytVideos.map(video => (
      <Tr key={video.url}>
        <Td role='cell'>{video.title}</Td>
        <Td role='cell'>{video.channel}</Td>
        <Td role='cell'>{video.duration}</Td>
        <Td >
          <Radio value={video.url} isChecked={radioButtonState === video.url} 
            onChange={() => {setRadioButtonState(video.url); voteVideoURL=video.url;}}
          >
            Play Next
          </Radio>
        </Td>
      </Tr>
  ));

  // Forces a render
  const handleForceUpdate = React.useCallback(() => {
    forceUpdate();
  }, [forceUpdate]);

  function addVideoToVideoList(inputURL: string) {
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
    
    try {
      // Get details for YouTube DATA API. for now filled with placeholders
      const newVideo: YTVideo = {url: inputURL, title: "NEW TITLE", channel: "NEW CHANNEL", duration: "TIME"};
      videoList.push(newVideo);
    } catch (err) {
      throw new Error(`Error processing request for submitted URL`)
    }
  };

  // We might need to use this as a useCallback instead of a normal function as seen below in the commented code
  const handleAddNewURL = React.useCallback(() => {
      try {
      if (!newVideoURL || newVideoURL.length === 0) {
        toast({
          title: 'Unable to submit video suggestion',
          description: 'Please enter a valid Youtube URL',
          status: 'error',
        });
        return;
      }
      addVideoToVideoList(newVideoURL);
      toast({
        title: `New video is added to the video collection!`,
        status: 'success',
        isClosable: true,
        duration: 3000,
      })
    } catch (err) {
      toast({
        title: 'Unable to add URL to video collection.',
        description: err.toString(),
        status: 'error'
      })
    }
  }, [newVideoURL, toast]);

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

  useEffect(() => {
    const getVideoList = () => {
      setYTVideos(getVideos()); // getVideo is the getter to get youtube videos list. function in import
    }
    getVideoList();
    const timeout = setTimeout(() => getVideoList(), 2000);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  // Andrew - set up sockets to receive messages from server
  useEffect(() => {
    socket?.on('newURLOption', (newURLOption: string) => {
        console.log('Received new URL option to display and maybe vote on');
        setNewVideoURL(newURLOption);
        // Andrew - handleAddNewURL() causes hundreds of re-renders. 
        handleAddNewURL();
        // handleForceUpdate(); // ANDREW - CONSIDER MOVING THIS INTO handleAddNewURL() TO AVOID DEPENDENCY ISSUE
    });
    socket?.on('enableVotingButton', () => {
        console.log('Client should enable voting button now');
        setVotingButtonDisabled(false);
    });
  },[socket, handleAddNewURL]); // , handleAddNewURL, handleForceUpdate]);

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
            <Input name="newVideo" placeholder="Youtube URL" value={newVideoURL} onChange={event => setNewVideoURL(event.target.value)}/>
            <FormHelperText>Please enter in the Youtube URL.</FormHelperText>
          </FormControl>
          <Button colorScheme="blue" 
            onClick={() => {
                // should send the URL to the server to check if it is valid
                socket?.emit('clientProposedNewURL', newVideoURL);

                // Andrew - the re-rendering is handled when the socket receives the URL from the server if it's valid
            //   handleAddNewURL(); 
            //   handleForceUpdate();
            }}
          >
            Submit New Video
          </Button>
        </Stack>
      </form>
    : null } </>
  );
}