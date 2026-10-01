// ABOUTME: Browser entry point — mounts App into the #root element.
// ABOUTME: Vite's index.html loads this module.

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
