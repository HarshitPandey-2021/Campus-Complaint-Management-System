import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './main.css';
import { DarkModeProvider } from './context/DarkModeContext.jsx' // ✅ ADD

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DarkModeProvider>
      <App />
    </DarkModeProvider>
  </React.StrictMode>,
)

