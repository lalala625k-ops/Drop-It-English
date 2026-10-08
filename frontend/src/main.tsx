import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserMigration } from './components/BrowserMigration';
import './index.css';
import { initializeLanguage } from './i18n';

void initializeLanguage().then(() => ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {new URLSearchParams(location.search).has('migrate') ? <BrowserMigration /> : <App />}
  </React.StrictMode>
));
