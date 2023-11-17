import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import HasagiClient from '@hasagi/extended';

new HasagiClient().connect().then(() => { console.log(187) })

window.React = React; // No idea why this is needed, but it is.

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <App />
);