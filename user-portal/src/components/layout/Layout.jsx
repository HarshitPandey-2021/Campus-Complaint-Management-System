// src/components/layout/Layout.jsx
import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Navbar */}
      <Navbar onMenuClick={handleToggleSidebar} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

        {/* Main Content */}
        <main className="flex-1 w-full min-h-screen pt-16 lg:ml-64 transition-all duration-300">
          <div className="w-full h-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;