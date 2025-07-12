import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
/* enables routing to show different pages */
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
