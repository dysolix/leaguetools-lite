import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

window.React = React; // No idea why this is needed, but it is.

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <App />
);