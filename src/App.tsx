import { useContext } from 'react';
import './App.css';
import { ContextProviders, LoLContext } from './context';
import React from 'react';

function App() {
  return (
    <ContextProviders>
      <React.StrictMode>
        <Test />
      </React.StrictMode>
    </ContextProviders>
  );
}

function Test() {
  const lolContext = useContext(LoLContext);
  return (
    <div>
      Connected: {String(lolContext.isConnected)}<br />
      State: {lolContext.state}<br />
      Gameflow phase: {lolContext.gameflowPhase}
    </div>
  )
}

export default App;