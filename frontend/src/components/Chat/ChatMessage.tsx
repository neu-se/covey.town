import { Text } from '@chakra-ui/react';
import React from 'react';

// import messages from TownServiceClient
type MessageProps = {
  key: string;
  userName: string;
  color: string;
  message: string;
}

export default function ChatMessage({key, userName, color, message}: MessageProps): JSX.Element {
    return (
          <Text key={key} color={color}>
            {userName}: {message}
          </Text>
    );
  }