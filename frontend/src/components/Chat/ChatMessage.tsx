import { Text } from '@chakra-ui/react';
import React from 'react';

// import messages from TownServiceClient
type MessageProps = {
  key: string;
  userName: string;
  message: string;
}

export default function ChatMessage({key, userName, message}: MessageProps): JSX.Element {
    return (
          <Text key={key}>
            {userName}: {message}
          </Text>
    );
  }