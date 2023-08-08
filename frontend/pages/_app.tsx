import './App.css';

// export default function App() : JSX.Element {
//     return <>Hi</>
// } 

import dynamic from 'next/dynamic';

//eslint-disable-next-line @typescript-eslint/naming-convention
const DynamicComponentWithNoSSR = dynamic(() => import('../src/App'), { ssr: false });

function NextApp() {
  return <DynamicComponentWithNoSSR />;
}

export default NextApp;