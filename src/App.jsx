import React, { useState } from "react";
import Sidebar from "./components/UI/Sidebar";
import Navbar from "./components/UI/Navbar";
// import SidebarOverlay from "./components/UI/SidebarOverlay";

import Display from "./pages/Display";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex  bg-black">
      <Navbar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <Display />
    </div>
  );
};

export default App;
