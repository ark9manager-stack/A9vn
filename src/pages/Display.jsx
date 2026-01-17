import React from "react";
import { Route, Routes } from "react-router-dom";
import DisplayHome from "./DisplayHome";
import Music from "./Music";
import ScrollNavigation from "../components/Navigation/ScrollNavigation";
import SectionIndicator from "../components/Navigation/SectionIndicator";
import Operator from "./Operator";

const Display = () => {
  return (
    <div className="w-full h-full m-2 rounded bg-[#121212] text-white overflow-hidden">
      <ScrollNavigation />
      <SectionIndicator />
      <Routes>
        <Route
          path="/"
          element={
            <div className="fullpage-container scrollbar-hide">
              <DisplayHome />
              <Operator />
              <Music />
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default Display;
