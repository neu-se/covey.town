import React, { useState } from "react";
import { ListItem } from "@material-ui/core";
import { Message } from "../../CoveyTypes";

interface ChatProps{
  message: Message;
  playerName: string;
}

const ChatItem: React.FunctionComponent<ChatProps> = (props) => {
  const message = props.message;
  const playerName = props.playerName;
  const isOwnMessage: boolean = message?.author === playerName;

  const styles = {
    listItem: (isOwnMessage: boolean) => ({
      flexDirection: "column",
      alignItems: isOwnMessage ? "flex-end" : "flex-start",}) as const,
    container: (isOwnMessage: boolean) => ({
      maxWidth: "75%",
      borderRadius: 12,
      padding: 16,
      color: "white",
      fontSize: 12,
      backgroundColor: isOwnMessage ? "#054740" : "#262d31",
    }),
    author: { fontSize: 10, color: "gray" },
    timestamp: { fontSize: 8, color: "white", textAlign: "right", paddingTop: 4 } as const,
  };

  return <>
    <ListItem style={styles.listItem(isOwnMessage)}>
      <div style={styles.author}>{message.author}</div>
      <div style={styles.container(isOwnMessage)}>
          {message}
        <div style={styles.timestamp}>
          {new Date(message.dateCreated.toISOString()).toLocaleString()}
        </div>
      </div>
    </ListItem>
  </>
}

export default ChatItem;

