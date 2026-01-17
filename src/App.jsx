import React, { useState } from "react";
import Sidebar from "./components/UI/Sidebar";
import Navbar from "./components/UI/Navbar";
// import SidebarOverlay from "./components/UI/SidebarOverlay";
import Player from "./components/Player/Player";
import Display from "./pages/Display";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="h-screen bg-black">
      <Navbar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div className="h-screen">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <Display />
      </div>

      <Player />
    </div>
  );
};

export default App;
