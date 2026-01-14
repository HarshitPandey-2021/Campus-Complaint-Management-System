import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./main.css";
import { DarkModeProvider } from "./context/DarkModeContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

const isProduction = import.meta.env.PROD;

const AppWrapper = isProduction ? (
  <DarkModeProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </DarkModeProvider>
) : (
  <React.StrictMode>
    <DarkModeProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </DarkModeProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById("root")).render(AppWrapper);
