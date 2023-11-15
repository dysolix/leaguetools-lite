import './App.css';
import { ContextProviders } from './context';
import React from 'react';
import { PageContent, SideBar, TitleBar } from './components';

function App() {
  return (
    <ContextProviders>
      <React.StrictMode>
        <TitleBar />
        <div id="app-body">
          <SideBar />
          <PageContent />
        </div>
      </React.StrictMode>
    </ContextProviders>
  );
}

export default App;