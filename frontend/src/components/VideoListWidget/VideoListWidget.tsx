import React, { useEffect, useState } from 'react';
import { Box, Button, FormControl, FormHelperText, FormLabel, Input, Stack, Table, Tbody, Td, Th, Thead, Tr, Radio, Heading, useToast, HStack } from '@chakra-ui/react';
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

  // const toast = useToast();
  const [newVideoURL, setNewVideoURL] = useState('');
  const [ytVideos, setYTVideos] = useState<YTVideo[]>([]);
  const [radioButtonState, setRadioButtonState] = useState(''); // Andrew - changed to ytVideos instead of global videoList
  const [votingButtonDisabled, setVotingButtonDisabled] = useState<boolean>(false);
  const [showWidget, setShowWidget] = useState<boolean>(false);

  const listVideos = () => ytVideos.map(video => (
      <Tr key={video.url}>
        <Td role='cell'>{video.title}</Td>
        <Td role='cell'>{video.channel}</Td>
        <Td role='cell'>{video.duration}</Td>
        <Td >
          <Radio value={video.url} isChecked={radioButtonState === video.url} 
            onChange={() => {setRadioButtonState(video.url);}}
          >
            Play Next
          </Radio>
        </Td>
      </Tr>
  ));

  // Andrew - set up sockets to receive messages from server
  useEffect(() => {
    socket?.on('nextVideoOptions', (nextVideoOptions: YTVideo[]) => {
        setYTVideos(nextVideoOptions);
    });
    socket?.on('enableVotingButton', () => {
        setVotingButtonDisabled(false);
    });
    socket?.on('resetVideoOptions', () => {
        setYTVideos([]);
        setShowWidget(false);
    });
    socket?.on('displayVotingWidget', () => {
      setShowWidget(true);
    })
  },[socket]);

  // Joe - for new url submission. Check if URL is valid. If not say not added, if yes add it. Need to get youtube title, channel, duration using youtube api
  // Andrew - Only display if showYTPlayer is true (when player is by TV)
  return (
    <> { showYTPlayer && showWidget ? 
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
                // send the URL to the server to check if it is valid
                // Andrew - the re-rendering is handled when the socket receives the URL from the server if it's valid
                socket?.emit('clientProposedNewURL', newVideoURL);
            }}
          >
            Submit New Video
          </Button>
        </Stack>
      </form>
    : null } </>
  );
}