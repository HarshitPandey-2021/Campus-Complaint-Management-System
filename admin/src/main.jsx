// SIMPLEST FIX - Replace entire file with this:
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./main.css";
import { DarkModeProvider } from "./context/DarkModeContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <DarkModeProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </DarkModeProvider>
);