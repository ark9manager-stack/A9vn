import { useContext } from "react";
import { MusicPlayerContext } from "./MusicPlayerStore";

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used inside MusicPlayerProvider");
  }
  return context;
}
