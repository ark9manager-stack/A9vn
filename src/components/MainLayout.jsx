import React from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./UI/Navbar";
import useScrollRestoration from "../hooks/useScrollRestoration";

// The MainLayout component is designed to be persistent across route changes.
// It uses the <Outlet> component from react-router-dom to render child routes dynamically.
// The Framer Motion animation ensures smooth transitions without unmounting the layout itself.

const MainLayout = () => {
  useScrollRestoration();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />
      <main>
        <Outlet />
      </main>
    </motion.div>
  );
};

export default MainLayout;
