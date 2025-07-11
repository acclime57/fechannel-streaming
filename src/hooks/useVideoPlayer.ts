import { useState, useEffect, useRef } from 'react';
import { VideoPlayerState } from '../types';
import { dataService } from '../services/dataService';

export function useVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const commercialVideoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    showControls: true
  });

  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [commercials, setCommercials] = useState<any[]>([]);
  const [currentCommercial, setCurrentCommercial] = useState<any | null>(null);
  const [showingCommercial, setShowingCommercial] = useState(false);
  const [commercialPlayed, setCommercialPlayed] = useState(false);
  
  // Fetch commercials data on component mount
  useEffect(() => {
    const fetchCommercials = async () => {
      try {
        const data = await dataService.getVideos();
        if (data && data.commercials) {
          setCommercials(data.commercials);
        }
      } catch (error) {
        console.error('Error loading commercials:', error);
      }
    };
    
    fetchCommercials();
  }, []);

  // Play a random commercial
  const playCommercial = () => {
    if (commercials.length === 0 || commercialPlayed) return;
    
    const randomIndex = Math.floor(Math.random() * commercials.length);
    const commercial = commercials[randomIndex];
    
    setCurrentCommercial(commercial);
    setShowingCommercial(true);
    setCommercialPlayed(true);
    
    if (commercialVideoRef.current) {
      commercialVideoRef.current.src = commercial.video_url;
      commercialVideoRef.current.load();
      commercialVideoRef.current.play().catch(err => {
        console.error('Error playing commercial:', err);
        setShowingCommercial(false);
      });
    }
  };
  
  // Handle main video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: video.currentTime }));
      
      // Play commercial at 5% into the video if not played yet
      if (!commercialPlayed && video.currentTime > (video.duration * 0.05) && video.currentTime < (video.duration * 0.1)) {
        playCommercial();
      }
    };

    const handleDurationChange = () => {
      setState(prev => ({ ...prev, duration: video.duration }));
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    };

    const handleVolumeChange = () => {
      setState(prev => ({ 
        ...prev, 
        volume: video.volume,
        isMuted: video.muted
      }));
    };

    const handleFullscreenChange = () => {
      setState(prev => ({ 
        ...prev, 
        isFullscreen: !!document.fullscreenElement
      }));
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [commercialPlayed, commercials]);
  
  // Handle commercial video events
  useEffect(() => {
    const commercialVideo = commercialVideoRef.current;
    if (!commercialVideo) return;
    
    const handleCommercialEnded = () => {
      setShowingCommercial(false);
      if (videoRef.current) {
        videoRef.current.play().catch(err => {
          console.error('Error resuming main video:', err);
        });
      }
    };
    
    commercialVideo.addEventListener('ended', handleCommercialEnded);
    
    return () => {
      commercialVideo.removeEventListener('ended', handleCommercialEnded);
    };
  }, []);

  const play = () => {
    videoRef.current?.play();
  };

  const pause = () => {
    videoRef.current?.pause();
  };

  const togglePlay = () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const seek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const setVolume = (volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const toggleFullscreen = async () => {
    if (!videoRef.current) return;

    try {
      if (state.isFullscreen) {
        await document.exitFullscreen();
      } else {
        await videoRef.current.requestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const showControls = () => {
    setState(prev => ({ ...prev, showControls: true }));
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (state.isPlaying) {
        setState(prev => ({ ...prev, showControls: false }));
      }
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  const hideControls = () => {
    if (state.isPlaying) {
      setState(prev => ({ ...prev, showControls: false }));
    }
  };

  return {
    videoRef,
    commercialVideoRef,
    state,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
    showControls,
    hideControls,
    showingCommercial,
    currentCommercial
  };
}