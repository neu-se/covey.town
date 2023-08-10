import './App.css';
import React from 'react';
import dynamic from 'next/dynamic';

//eslint-disable-next-line @typescript-eslint/naming-convention
const DynamicComponentWithNoSSR = dynamic(() => import('../src/App'), { ssr: false });

function NextApp() {
  return <DynamicComponentWithNoSSR />;
}

export default NextApp;
