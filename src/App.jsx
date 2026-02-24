import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Sidebar from "./components/UI/Sidebar";
import Navbar from "./components/UI/Navbar";
import Display from "./pages/Display";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex bg-black">
      <Navbar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/Home" replace />} />
          <Route path="/Home" element={<Display />} />
          <Route path="/Operator" element={<Display />} />
          <Route path="/Music" element={<Display />} />
          <Route path="/home" element={<Navigate to="/Home" replace />} />
          <Route
            path="/operator"
            element={<Navigate to="/Operator" replace />}
          />
          <Route path="/music" element={<Navigate to="/Music" replace />} />
          <Route path="/:slug" element={<Display />} />
          <Route path="*" element={<Navigate to="/Home" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
