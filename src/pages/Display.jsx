import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import Music from "./Music";
import ScrollNavigation from "../components/Navigation/ScrollNavigation";
import SectionIndicator from "../components/Navigation/SectionIndicator";
import Operator from "./Operator";
import useScrollRouter from "../hooks/useScrollRouter";

const sections = [
  { id: "home", path: "/" },
  { id: "operator", path: "/operator" },
  { id: "music", path: "/music" },
];

const Display = () => {
  useScrollRouter(sections);

  return (
    <div className="w-full h-full rounded bg-[#121212] text-white overflow-y-auto">
      <ScrollNavigation />
      <SectionIndicator />
      <div className="fullpage-container scrollbar-hide">
        <div id="home">
          <Home />
        </div>
        <div id="operator">
          <Operator />
        </div>
        <div id="music">
          <Music />
        </div>
      </div>
    </div>
  );
};

export default Display;
