import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { initApiConfig } from './utils/apiConfig.js';
import 'leaflet/dist/leaflet.css';
import './index.css';

// Initialize production API interception for Vercel -> Render communication
initApiConfig();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

