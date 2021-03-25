// handle channels in this file- wrap chatscreen in tab/tabpanels
// how to store channels and messages? I guess I can have 1 array of channels, then have chatscreen get the messages.
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Client from 'twilio-chat';
import {Channel} from 'twilio-chat/lib/channel';
import {Button, Tabs, Tab, TabList, TabPanels, TabPanel, Menu, MenuButton, MenuList, MenuOptionGroup, MenuItemOption, MenuDivider} from "@chakra-ui/react";


import {nanoid} from 'nanoid';
import useCoveyAppState from "../../hooks/useCoveyAppState";
import ChatScreen from "./ChatScreen";
import Player from "../../classes/Player";
import useNearbyPlayers from "../../hooks/useNearbyPlayers";



export default function ChannelWrapper({chatToken}: { chatToken: string }): JSX.Element {
  const [client, setClient] = useState<Client>();
  const [loading, setLoading] = useState<boolean>(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [mainChannelJoined, setMainChannelJoined] = useState<boolean>(false);
  const {currentTownID, currentTownFriendlyName, userName, players, myPlayerID} = useCoveyAppState();

  const addChannel = (newChannel: Channel) => {
    const exists = channels.find(each => each.uniqueName === newChannel.uniqueName);
    if (!exists) {
      setChannels(old => [...old, newChannel]);
    } else {
      if (newChannel.uniqueName === currentTownID) {
        setMainChannelJoined(true);
      }
      console.log("Channel already Added.");
    }
  }

  const joinChannel = async (channelToJoin: Channel) => {
    if (channelToJoin.status === "joined") {
      if(channelToJoin.uniqueName === currentTownID){
        addChannel(channelToJoin);
      }
      console.log(`Channel, ${channelToJoin.friendlyName} already joined.`);
    } else {
      console.log(`Status for ${channelToJoin.friendlyName} is ${channelToJoin.status}`);
      const response = await channelToJoin.join();
      channelToJoin.sendMessage(`${userName} joined the main chat for ${channelToJoin.friendlyName}`);
      addChannel(response);
    }
  }

  const createChannel = async (channelID: string, channelFriendlyName: string) => {
    if (client) {
      const createdChannel = await client.createChannel({
        uniqueName: channelID,
        friendlyName: channelFriendlyName,
      });

      console.log(`${createdChannel.friendlyName} has been created!`)
      return createdChannel;
    }
    throw Error(`Something went wrong, client error. Please come back later.`);
  }

  const mainChannelLogIn = async () => {
    if (client) {
      // setChannels((await client.getSubscribedChannels()).items);

      client.on('channelJoined', async (joinedChannel: Channel) => {
        // const channelMessages = await joinedChannel.getMessages();
        console.log(`chat client channelJoined event on ${joinedChannel.friendlyName} has occurred`);
      });

      client.on('channelInvited', async (channel) => {
        console.log(`Invited to channel ${channel.friendlyName}`);
        // Join the channel that you were invited to
        await channel.join();
        channel.sendMessage(`${userName} joined the chat for ${channel.friendlyName}`);
        setChannels(oldChannels =>[...oldChannels, channel])
      });

    }
    try {
      if (client) {
        const mainChannel = await client.getChannelByUniqueName(currentTownID);
        await joinChannel(mainChannel);
        setMainChannelJoined(true);
      }
    } catch {
      try {
        const created = await createChannel(currentTownID, currentTownFriendlyName);
        await joinChannel(created);
        setMainChannelJoined(true);
      } catch {
        throw new Error(`Unable to create or join channel for ${currentTownFriendlyName}`);
      }
    }
  }

  const createPrivateChannel = async () => {
    try {
      const created = await createChannel(nanoid(), nanoid(5));
      await joinChannel(created);
    } catch {
      throw new Error(`Unable to create or join channel for ${currentTownFriendlyName}`);
    }
  }

  // UseEffect-- on mounting, gets the chat client object.
  // could also attempt to join main room chat here.
  useEffect(() => {
    let isMounted = true;
    const logIn = async () => {
      setLoading(true);
      try {

        const newClient = await Client.create(chatToken);
        if (isMounted) setClient(newClient);
        setLoading(false);
      } catch (error) {
        throw new Error(`Unable to create client for ${currentTownFriendlyName}: \n${error}`);
      }
    };
    logIn();
    return () => {
      isMounted = false
    };

  }, [chatToken, currentTownFriendlyName]);


  const renderTabs = (channels).map(c => {
    const {friendlyName, uniqueName} = c;
    return (
      <Tab key={uniqueName}>
        {friendlyName}
      </Tab>
    )
  });

  const renderTabScreens = (channels).map(c => {
    const {uniqueName} = c;
    return (
      <TabPanel p={50} key={uniqueName}>
        <ChatScreen channel={c}/>
      </TabPanel>
    )
  });


  // Private messaging work

  const createPrivateChannelFromMenu = async (currentPlayer: string, playerToPM: Player) => {
    try {
      const created = await createChannel(nanoid(), `Private Message with ${playerToPM.userName}`);
      await joinChannel(created);

      try {
        await created.invite(playerToPM.userName)
      } catch(e){
        throw new Error(`${e}`);
      }

    } catch {
      throw new Error(`Unable to create or join channel for ${currentTownFriendlyName}`);
    }
  };



  // filter the player list to only show people not the current player
  const filteredPlayerList = useNearbyPlayers().nearbyPlayers;

  // players.filter(player => player.id !== myPlayerID);

  const renderPrivateMessageList = filteredPlayerList.map(player => (
    <MenuItemOption key={player.id} value={player.id}
                    onClick={() =>{createPrivateChannelFromMenu(myPlayerID, player)}}>{player.userName}</MenuItemOption>
  ));


  return (
    <>
      <Tabs>
        <TabList>
          {renderTabs}
        </TabList>
        <TabPanels>
          {renderTabScreens}
        </TabPanels>
      </Tabs>
      <Button onClick={mainChannelLogIn} isDisabled={mainChannelJoined}>Log in to Main
        Channel</Button>
      <Button onClick={createPrivateChannel}>Start New Chat</Button>

      <Menu>
        <MenuButton as={Button}>
          Private Message
        </MenuButton>
        <MenuList minWidth="240px" maxHeight="400px" overflow="auto">
          <MenuOptionGroup title="Select User To Private Message">
            {renderPrivateMessageList}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </>

  )
}
