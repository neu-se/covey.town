import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import React from 'react';

export default function ChatSelectContainer(): JSX.Element {
  return (
    <Tabs isFitted variant='enclosed' defaultIndex={0} size="md">
      <TabList mb='1em'>
        <Tab>Direct Chat</Tab>
        <Tab>Town Chat</Tab>
        <Tab>Proximity Chat</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <p>Direct Messages:</p>
        </TabPanel>
        <TabPanel>
          <p>Town Messages:</p>
        </TabPanel>
        <TabPanel>
          <p>Proximity Messages:</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

