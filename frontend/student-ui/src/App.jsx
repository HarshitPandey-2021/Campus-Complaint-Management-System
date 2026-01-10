// src/App.jsx - CORRECT (NO BrowserRouter here)
import { Routes, Route } from "react-router-dom"; // ✅ Only Routes, Route
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

export default function App() {
  return (
    <Routes>  {/* ✅ NO BrowserRouter wrapper */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}
