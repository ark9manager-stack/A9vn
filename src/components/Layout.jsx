import { Outlet } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import CassettePlayer from "./Music/CassettePlayer";
import { useMusicPlayer } from "../contexts/useMusicPlayer";

export default function Layout() {
  const { currentTrack } = useMusicPlayer();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-1 pt-12 ${currentTrack ? "pb-36 md:pb-32" : ""}`}>
        <Outlet />
      </main>
      <Footer />
      <CassettePlayer />
    </div>
  );
}
