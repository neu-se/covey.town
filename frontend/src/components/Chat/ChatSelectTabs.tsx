import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import React from 'react';

export default function ChatSelectContainer(): JSX.Element {
  return (
    <Tabs isFitted variant='enclosed' defaultIndex={0}>
      <TabList mb='1em'>
        <Tab>Direct Messages</Tab>
        <Tab>Town Messages</Tab>
        <Tab>Proximity Messages</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <p>Direct Messages:</p>
        </TabPanel>
        <TabPanel>
          <p>Town Messages:</p>
        </TabPanel>
        <TabPanel>
          <p>Proximty Messages:</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
