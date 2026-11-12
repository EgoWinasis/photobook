
"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Pause, Play } from "lucide-react";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const startMusic = async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      setPlaying(true);
    } catch (error) {
      console.log("Musik belum dapat diputar:", error);
      setPlaying(false);
    }
  };

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      await startMusic();
    }
  };

  useEffect(() => {
    const startAfterInteraction = () => {
      startMusic();
      window.removeEventListener("click", startAfterInteraction);
      window.removeEventListener("keydown", startAfterInteraction);
      window.removeEventListener("touchstart", startAfterInteraction);
    };

    window.addEventListener("click", startAfterInteraction);
    window.addEventListener("keydown", startAfterInteraction);
    window.addEventListener("touchstart", startAfterInteraction);

    return () => {
      window.removeEventListener("click", startAfterInteraction);
      window.removeEventListener("keydown", startAfterInteraction);
      window.removeEventListener("touchstart", startAfterInteraction);
    };
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        src="/music/romantic-piano.mp3"
        loop
        preload="auto"
      />

      <button
        onClick={toggleMusic}
        className="music-button"
        aria-label={playing ? "Matikan musik" : "Putar musik"}
        title={playing ? "Pause musik" : "Putar musik"}
      >
        {playing ? <Pause size={18} /> : <Play size={18} />}
        <Music size={16} />
      </button>
    </>
  );
}
