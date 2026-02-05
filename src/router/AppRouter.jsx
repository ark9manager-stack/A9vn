import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import Display from "../pages/Display";
import Home from "../pages/Home";
import Music from "../pages/Music";
import Operator from "../pages/Operator";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="music" element={<Music />} />
          <Route path="operator" element={<Operator />} />
          <Route path="display" element={<Display />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
