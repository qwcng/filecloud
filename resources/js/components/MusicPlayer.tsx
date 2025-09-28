import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";

interface MusicPlayerProps {
  src: string;
  title: string;
  artist: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ src, title, artist }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [volume, setVolume] = useState<number>(50);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setProgress(audioRef.current.currentTime);
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
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const setAudioData = () => setDuration(audio.duration);
    const updateProgress = () => handleTimeUpdate();

    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", updateProgress);

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="  bg-gray-900 text-white p-4 rounded-xl w-full max-w-md mx-auto shadow-lg">
      <audio ref={audioRef} src={src} />
      <div className="flex flex-col space-y-2">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-400">{artist}</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-2">
          <span className="text-xs">{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={duration ? (progress / duration) * 100 : 0}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-700 rounded-lg accent-green-500 cursor-pointer"
          />
          <span className="text-xs">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center space-x-6 mt-2">
            <div></div>
            <div></div>
          <button className="hover:text-green-500">
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={togglePlay}
            className="bg-green-500 hover:bg-green-600 text-black p-3 rounded-full"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button className="hover:text-green-500">
            <ChevronRight size={24} />
          </button>
          <input
            type="range"
            min={0}
            max={250}
            value={volume}
            onChange={handleVolumeChange}
            className="w-10 h-1 bg-gray-700 rounded-lg accent-green-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
