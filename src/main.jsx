import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
// main.jsx or main.js
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { registerSW } from 'virtual:pwa-register';

// Force an already-open tab to pick up a new deploy right away instead of
// silently continuing to run whatever version was cached when it was
// opened - this is what keeps the PWA's offline caching from reintroducing
// the "I deployed but nothing changed" problem we hit earlier this project.
registerSW({ immediate: true, onNeedRefresh: () => window.location.reload() });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
