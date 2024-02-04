import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import SendPage from './components/Send';
import RecievePage from './components/Recieve';
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <Routes>

        <Route path="/" Component={Home} />

        <Route path='/send' Component={SendPage} />

        <Route path='/recieve' Component={RecievePage} />

      </Routes>
    </React.StrictMode>
  </BrowserRouter>
);

