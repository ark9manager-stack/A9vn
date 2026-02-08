import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Sidebar from "./components/UI/Sidebar";
import Navbar from "./components/UI/Navbar";

import Home from "./pages/Home";
import Operator from "./pages/Operator";
import Music from "./pages/Music";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex bg-black h-screen w-screen overflow-hidden">
      <Navbar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 h-full">
        <Routes>
          <Route path="/" element={<Navigate to="/Home" replace />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Operator" element={<Operator />} />
          <Route path="/Music" element={<Music />} />
          <Route path="/Operator=:operatorId" element={<Operator />} />
          <Route path="/home" element={<Navigate to="/Home" replace />} />
          <Route path="/operator" element={<Navigate to="/Operator" replace />} />
          <Route path="/music" element={<Navigate to="/Music" replace />} />
          <Route path="*" element={<Navigate to="/Home" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
