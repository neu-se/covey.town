// handle channels in this file- wrap chatscreen in tab/tabpanels
// how to store channels and messages? I guess I can have 1 array of channels, then have chatscreen get the messages.
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Client from 'twilio-chat';
import {Channel} from 'twilio-chat/lib/channel';
import {Button, Tabs, Tab, TabList, TabPanels, TabPanel } from "@chakra-ui/react";

import { nanoid } from 'nanoid';
import useCoveyAppState from "../../hooks/useCoveyAppState";
import ChatScreen from "./ChatScreen";

export default function ChannelWrapper(): JSX.Element {
    const [client, setClient] = useState<Client>();
    const [loading, setLoading] = useState<boolean>(false);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [mainChannelJoined, setMainChannelJoined] = useState<boolean>(false);
    const { currentTownID, currentTownFriendlyName, userName } = useCoveyAppState();

    const addChannel = (newChannel : Channel) => {
        const exists = channels.find(each=> each.uniqueName === newChannel.uniqueName);
        if (!exists) {
            setChannels(old=>[...old, newChannel]);
        } else {
            if(newChannel.uniqueName === currentTownID) {
                setMainChannelJoined(true);
            }
            console.log("Channel already Added.");
        }
    }

    const joinChannel = async(channelToJoin : Channel) => {
        if (channelToJoin.status === "joined"){
            console.log(`Channel, ${channelToJoin.friendlyName} already joined.`);
        } else {
            console.log(`Status for ${channelToJoin.friendlyName} is ${channelToJoin.status}`);
            const response = await channelToJoin.join(); 
            channelToJoin.sendMessage(`${userName} joined the main chat for ${channelToJoin.friendlyName}`);
            addChannel(response);
        }
    }

    const createChannel = async(channelID : string, channelFriendlyName : string)=> { 
        if(client){
            const createdChannel = await client.createChannel({
                uniqueName : channelID,
                friendlyName : channelFriendlyName,
            });
    
            console.log(`${createdChannel.friendlyName} has been created!`)
            return createdChannel;
        } 
        throw Error(`Something went wrong, client error. Please come back later.`);
    }

    const mainChannelLogIn = async()=> {
        if(client){
            setChannels((await client.getSubscribedChannels()).items);

            client.on('channelJoined', async(joinedChannel : Channel)=> {
            // const channelMessages = await joinedChannel.getMessages();
            console.log(`chat client channelJoined event on ${joinedChannel.friendlyName} has occured`);
            });
        }
        try {
            if(client){
                const mainChannel = await client.getChannelByUniqueName(currentTownID);
                await joinChannel(mainChannel);
                setMainChannelJoined(true);
            }
        }catch {
            try{
                const created = await createChannel(currentTownID, currentTownFriendlyName);
                await joinChannel(created);
                setMainChannelJoined(true);
            } catch {
                throw new Error(`Unable to create or join channel for ${currentTownFriendlyName}`);
            }
        }
    }

    const createPrivateChannel = async()=> {
        try{
            const created = await createChannel(nanoid(), nanoid(5));
            await joinChannel(created);
        } catch {
            throw new Error(`Unable to create or join channel for ${currentTownFriendlyName}`);
        }
    }
   
    // Get chat token
    // also currently, since token is based on username entered, if same usernames are in the chat
    // token generated is the same--need to fix this.
    const getToken = async (email: string) => {
        const response = await axios.get(`http://localhost:5000/token/${email}`);
        const { data } = response;
        return data.token;
      };

    // UseEffect-- on mounting, gets the chat client object. 
    // could also attempt to join main room chat here.
    useEffect(()=>{
        let isMounted = true;
        const logIn = async()=>{
            setLoading(true);
            try {
                const token = await getToken(userName);
                const newClient = await Client.create(token);
                if(isMounted) setClient(newClient);
                setLoading(false);
            }catch(error){
                throw new Error(`Unable to create client for ${currentTownFriendlyName}: \n${error}`);
            }
        };
        logIn();
        return () => {isMounted = false};
    }, [currentTownFriendlyName, userName]);
  
    
      const renderTabs = (channels).map(c =>{
        const {friendlyName, uniqueName} = c;
        return(
          <Tab key={uniqueName}>
            {friendlyName}
          </Tab>
        )
      });

      const renderTabScreens = (channels).map(c =>{
        const {uniqueName} = c;
        return(
          <TabPanel p={50} key={uniqueName}>
              <ChatScreen channel={c}/>
          </TabPanel>
        )
      });


    return(
        <>
        <Tabs>
            <TabList>
                {renderTabs}
            </TabList>
            <TabPanels>
                {renderTabScreens}
            </TabPanels>
        </Tabs>
        <Button onClick = {mainChannelLogIn} isDisabled={mainChannelJoined}>Log in to Main Channel</Button>
        <Button onClick = {createPrivateChannel}>Start New Chat</Button>
        </>
            
    )
    // return tabs + tab panels, with chat screen inside of tab panel
}