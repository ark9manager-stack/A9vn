import { Outlet } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import CassettePlayer from "./Music/CassettePlayer";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-12">
        <Outlet />
      </main>
      <Footer />
      <CassettePlayer />
    </div>
  );
}
