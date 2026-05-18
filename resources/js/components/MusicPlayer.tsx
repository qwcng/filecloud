import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, SkipBack, SkipForward, Music } from "lucide-react";

interface MusicPlayerProps {
  src: string;
  title: string;
  artist?: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ src, title, artist }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(50);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [prevVolume, setPrevVolume] = useState<number>(50);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.log("Autoplay blocked or load failed:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = (parseFloat(e.target.value) / 100) * duration;
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol / 100;
      audioRef.current.muted = vol === 0;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = prevVolume / 100;
      setVolume(prevVolume);
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      audioRef.current.volume = 0;
      setVolume(0);
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
  };

  const resetAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setProgress(0);
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const setAudioData = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", () => setIsPlaying(false));

    // wczytanie poprawnej dlugosci na starcie
    if (audio.readyState >= 1) {
      setDuration(audio.duration || 0);
    }

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, [src]);

  // format czasu: sekundy na MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="relative w-full max-w-md mx-auto bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Efektowne tło ze świecącym kołem w tle */}
      <div className="absolute -top-20 -left-20 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col space-y-5 relative z-10">
        
        {/* Sekcja grafiki / ikonki z wizualizatorem */}
        <div className="flex items-center gap-4">
          <div className={`relative flex items-center justify-center w-16 h-16 bg-neutral-800 border border-neutral-700 rounded-2xl shadow-inner transition-transform duration-500 ${isPlaying ? 'scale-105 border-blue-500/50' : ''}`}>
            <Music className={`h-7 w-7 text-blue-400 ${isPlaying ? 'animate-pulse' : ''}`} />
            
            {/* Mały wskaźnik grania w rogu okładki */}
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500"></span>
              </span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white truncate" title={title}>
              {title}
            </h3>
            <p className="text-xs text-neutral-400 truncate mt-0.5">
              {artist || "Nieznany wykonawca"}
            </p>
          </div>

          {/* Animowany mini-wizualizator w pętli */}
          {isPlaying && (
            <div className="flex items-end gap-0.5 h-5 shrink-0 px-2">
              <span className="w-0.75 bg-blue-500 rounded-full animate-[bounce_0.8s_infinite] h-3" />
              <span className="w-0.75 bg-indigo-400 rounded-full animate-[bounce_0.6s_infinite] h-5" style={{ animationDelay: '0.15s' }} />
              <span className="w-0.75 bg-blue-400 rounded-full animate-[bounce_0.7s_infinite] h-4" style={{ animationDelay: '0.3s' }} />
              <span className="w-0.75 bg-indigo-500 rounded-full animate-[bounce_0.5s_infinite] h-2" style={{ animationDelay: '0.45s' }} />
            </div>
          )}
        </div>

        {/* Pasek postępu (Timeline) */}
        <div className="space-y-1.5">
          <div className="relative group flex items-center">
            <input
              type="range"
              min={0}
              max={100}
              value={duration ? (progress / duration) * 100 : 0}
              onChange={handleSeek}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none transition hover:h-2"
            />
          </div>
          <div className="flex justify-between text-[11px] text-neutral-400 font-medium px-0.5">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Przyciski sterujące */}
        <div className="flex items-center justify-between pt-1">
          {/* Reset / restart */}
          <button 
            onClick={resetAudio} 
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800/40 transition" 
            title="Od początku"
          >
            <RotateCcw className="h-4.5 w-4.5" />
          </button>

          {/* Grupa głównych przycisków */}
          <div className="flex items-center gap-4">
            {/* Cofnij 10s */}
            <button 
              onClick={skipBackward} 
              className="p-2 text-neutral-300 hover:text-white rounded-full hover:bg-neutral-800/50 transition" 
              title="Cofnij 10 sekund"
            >
              <SkipBack className="h-5 w-5 fill-current" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className={`p-4 bg-blue-500 hover:bg-blue-600 hover:scale-105 text-white rounded-full shadow-lg shadow-blue-500/25 transition duration-200 active:scale-95`}
            >
              {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current translate-x-0.5" />}
            </button>

            {/* Dalej 10s */}
            <button 
              onClick={skipForward} 
              className="p-2 text-neutral-300 hover:text-white rounded-full hover:bg-neutral-800/50 transition" 
              title="Dalej 10 sekund"
            >
              <SkipForward className="h-5 w-5 fill-current" />
            </button>
          </div>

          {/* Dźwięk / Mute */}
          <div className="flex items-center gap-2 group/vol">
            <button 
              onClick={toggleMute} 
              className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800/40 transition"
            >
              {isMuted ? <VolumeX className="h-4.5 w-4.5 text-red-400" /> : <Volume2 className="h-4.5 w-4.5 text-blue-400" />}
            </button>
            
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={handleVolumeChange}
              className="w-0 opacity-0 group-hover/vol:w-16 group-hover/vol:opacity-100 transition-all duration-300 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default MusicPlayer;
