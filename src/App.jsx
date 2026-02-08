import React, { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "./components/UI/Sidebar";
import Navbar from "./components/UI/Navbar";
import Display from "./pages/Display";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex bg-black w-full">
      <Navbar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="flex-1">
        {/* 
          Tất cả path đều render cùng 1 Display (one-page scroll).
          Có Routes giúp history/back/forward ổn định & hỗ trợ reload trực tiếp các URL.
        */}
        <Routes>
          <Route path="/" element={<Navigate to="/Home" replace />} />

          {/* canonical */}
          <Route path="/Home" element={<Display />} />
          <Route path="/Operator" element={<Display />} />
          <Route path="/Music" element={<Display />} />
          <Route path="/Operator=:opId" element={<Display />} />

          {/* lowercase variants (đỡ lỗi user gõ /home /operator...) */}
          <Route path="/home" element={<Navigate to="/Home" replace />} />
          <Route path="/operator" element={<Navigate to="/Operator" replace />} />
          <Route path="/music" element={<Navigate to="/Music" replace />} />
          <Route path="/operator=:opId" element={<Display />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/Home" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
