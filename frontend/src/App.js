import React, { useState, useEffect } from "react";
import "./App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./components/Dashboard";
import LiveMapPage from "./components/LiveMapPage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <HashRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/live-map" element={<LiveMapPage />} />
          </Routes>
        </HashRouter>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;