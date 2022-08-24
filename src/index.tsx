import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from "./reportWebVitals";
import App from "./App";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ControlPanel from "./control-panel";
import OpponentsAttack from "./opponents-attack";
import Display from "./display";
import { Coach as OpponentsAttackCoach } from "./opponents-attack/coach";
import { SocketContext, getClient } from "./context/socket";
import Dashboard from "./dashboard";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SocketContext.Provider value={getClient()}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/:gameId" element={<Display />} />
          <Route path="/coach/:gameId" element={<OpponentsAttackCoach />} />
          <Route path="/coach/" element={<OpponentsAttackCoach />} />
          <Route path="/control-panel" element={<ControlPanel />} />
          <Route path="/opponents-attack" element={<OpponentsAttack showGameSelector={true} />} />
        </Routes>
      </SocketContext.Provider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
