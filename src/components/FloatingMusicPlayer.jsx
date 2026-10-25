import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  RotateCw,
  Volume2, 
  Volume1, 
  VolumeX, 
  Music, 
  Disc, 
  ChevronUp, 
  ChevronDown, 
  Radio,
  ExternalLink,
  Power
} from 'lucide-react';
import { 
  loadMusicSettings, 
  extractYouTubeId, 
  extractSpotifyEmbedUrl 
} from '../utils/musicData';

export function FloatingMusicPlayer() {
  const [settings, setSettings] = useState(loadMusicSettings);
  const [isPlaying, setIsPlaying] = useState(true); // Autoplay by default
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(() => settings.defaultVolume ?? 45);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(210);

  const audioRef = useRef(null);
  const ytIframeRef = useRef(null);

  // Sync settings when updated in Admin Dashboard
  useEffect(() => {
    const handleSettingsUpdated = (e) => {
      if (e.detail) {
        setSettings(e.detail);
        const idx = e.detail.playlist?.findIndex(t => t.id === e.detail.activeTrackId);
        if (idx !== -1 && typeof idx === 'number') setCurrentTrackIndex(idx);
      } else {
        const fresh = loadMusicSettings();
        setSettings(fresh);
      }
    };

    window.addEventListener('fp_music_settings_updated', handleSettingsUpdated);
    window.addEventListener('storage', (e) => {
      if (e.key === 'fp_zerofour_music_settings_v4' || e.key === 'fp_zerofour_music_settings_v3') {
        setSettings(loadMusicSettings());
      }
    });

    return () => {
      window.removeEventListener('fp_music_settings_updated', handleSettingsUpdated);
    };
  }, []);

  // Set initial track index based on settings
  useEffect(() => {
    if (settings.playlist && settings.playlist.length > 0) {
      const idx = settings.playlist.findIndex(t => t.id === settings.activeTrackId);
      if (idx !== -1) {
        setCurrentTrackIndex(idx);
      }
    }
  }, [settings.activeTrackId]);

  const playlist = (settings.playlist && settings.playlist.length > 0)
    ? settings.playlist 
    : (settings.track ? [settings.track] : []);
  // Always prioritize single track configured by admin if available
  const currentTrack = settings.track || playlist[currentTrackIndex] || playlist[0] || null;

  // Send command to YouTube iframe via postMessage
  const sendYtCommand = (func, args = []) => {
    try {
      if (ytIframeRef.current && ytIframeRef.current.contentWindow) {
        ytIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      }
    } catch (e) {
      console.warn('YouTube postMessage error:', e);
    }
  };

  // Autoplay on mount & on first user gesture anywhere on the web page
  useEffect(() => {
    let active = true;

    const startPlaying = () => {
      if (!active) return;
      if (currentTrack?.source === 'audio' && audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      } else if (currentTrack?.source === 'youtube') {
        sendYtCommand('playVideo');
        setIsPlaying(true);
      }
    };

    startPlaying();
    const timer = setTimeout(startPlaying, 600);

    const handleFirstGesture = () => {
      startPlaying();
      setIsPlaying(true);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('scroll', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('click', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('scroll', handleFirstGesture, { once: true, passive: true });

    return () => {
      active = false;
      clearTimeout(timer);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('scroll', handleFirstGesture);
    };
  }, [currentTrack?.url, currentTrack?.source]);

  // Handle Play / Pause
  const togglePlay = () => {
    setHasInteracted(true);
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (!currentTrack) return;

    if (currentTrack.source === 'audio' && audioRef.current) {
      if (nextState) {
        audioRef.current.play().catch(err => console.warn('Audio play failed:', err));
      } else {
        audioRef.current.pause();
      }
    } else if (currentTrack.source === 'youtube') {
      if (nextState) {
        sendYtCommand('playVideo');
      } else {
        sendYtCommand('pauseVideo');
      }
    }
  };

  // Next Track
  const handleNextTrack = () => {
    if (playlist.length <= 1) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    if (isPlaying) {
      // Re-trigger play for new track after short delay
      setTimeout(() => {
        setIsPlaying(true);
      }, 200);
    }
  };

  // Previous Track
  const handlePrevTrack = () => {
    if (playlist.length <= 1) return;
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrackIndex(prevIndex);
    if (isPlaying) {
      setTimeout(() => {
        setIsPlaying(true);
      }, 200);
    }
  };

  // Reset current time on track change
  useEffect(() => {
    setCurrentTime(0);
  }, [currentTrackIndex, settings.activeTrackId]);

  // Listen for YouTube player state and time updates via postMessage
  useEffect(() => {
    const handleYtMessage = (e) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number') {
            setCurrentTime(Math.floor(data.info.currentTime));
          }
          if (typeof data.info.duration === 'number' && data.info.duration > 0) {
            setDuration(Math.floor(data.info.duration));
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleYtMessage);
    return () => window.removeEventListener('message', handleYtMessage);
  }, []);

  // Smooth local timer ticker while playing
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          const max = duration > 0 ? duration : 240;
          if (prev + 1 >= max) return 0;
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration]);

  // Seek timeline slider change (ลากเลื่อนเพลง)
  const handleSeekChange = (e) => {
    const target = parseInt(e.target.value, 10);
    setCurrentTime(target);
    if (currentTrack?.source === 'audio' && audioRef.current) {
      audioRef.current.currentTime = target;
    } else if (currentTrack?.source === 'youtube') {
      sendYtCommand('seekTo', [target, true]);
    }
  };

  // Jump seek by +/- seconds (กดปุ่มเลื่อนเพลง)
  const handleSeekOffset = (seconds) => {
    const max = duration > 0 ? duration : 240;
    const nextTime = Math.max(0, Math.min(max, currentTime + seconds));
    setCurrentTime(nextTime);
    if (currentTrack?.source === 'audio' && audioRef.current) {
      audioRef.current.currentTime = nextTime;
    } else if (currentTrack?.source === 'youtube') {
      sendYtCommand('seekTo', [nextTime, true]);
    }
  };

  const formatTime = (secs = 0) => {
    const total = Math.max(0, Math.floor(secs));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Volume Change
  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    if (val > 0 && isMuted) {
      setIsMuted(false);
    }

    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : val / 100;
    }
    if (currentTrack?.source === 'youtube') {
      sendYtCommand('setVolume', [isMuted ? 0 : val]);
    }
  };

  // Mute / Unmute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
      audioRef.current.volume = nextMuted ? 0 : volume / 100;
    }
    if (currentTrack?.source === 'youtube') {
      if (nextMuted) {
        sendYtCommand('mute');
      } else {
        sendYtCommand('unMute');
        sendYtCommand('setVolume', [volume]);
      }
    }
  };

  // Keep volume synced with audio ref
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      audioRef.current.muted = isMuted;
    }
    if (currentTrack?.source === 'youtube') {
      if (isMuted) {
        sendYtCommand('mute');
      } else {
        sendYtCommand('unMute');
        sendYtCommand('setVolume', [volume]);
      }
    }
  }, [volume, isMuted, currentTrackIndex]);

  // If user disabled music completely in admin
  if (!settings.enabled) {
    return null;
  }

  const ytId = currentTrack?.source === 'youtube' ? extractYouTubeId(currentTrack?.url) : '';
  const spotifyEmbedUrl = currentTrack?.source === 'spotify' ? extractSpotifyEmbedUrl(currentTrack?.url) : '';

  return (
    <aside 
      className={`floating-music-widget ${isExpanded ? 'expanded' : 'collapsed'}`}
      aria-label="ตัวเล่นเพลงพื้นหลัง FP Zerofour"
    >
      {/* =========================================================================
          AUDIO ENGINES (YouTube, Direct MP3, Spotify)
          ========================================================================= */}
      
      {/* 1. Direct HTML5 Audio */}
      {currentTrack?.source === 'audio' && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          loop
          preload="auto"
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(Math.floor(audioRef.current.currentTime));
              if (audioRef.current.duration) {
                setDuration(Math.floor(audioRef.current.duration));
              }
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current && audioRef.current.duration) {
              setDuration(Math.floor(audioRef.current.duration));
            }
          }}
        />
      )}

      {/* 2. YouTube IFrame Player (Off-screen with enablejsapi=1, static URL to prevent reload on play/pause) */}
      {currentTrack?.source === 'youtube' && ytId && (
        <div className="hidden-yt-player-container" aria-hidden="true">
          <iframe
            ref={ytIframeRef}
            key={ytId}
            title="FP TCG Background Music"
            src={`https://www.youtube-nocookie.com/embed/${ytId}?enablejsapi=1&autoplay=1&loop=1&playlist=${ytId}&playsinline=1&controls=0&disablekb=1&fs=0&rel=0`}
            allow="autoplay; encrypted-media; picture-in-picture"
            tabIndex="-1"
            onLoad={() => {
              if (isPlaying) {
                setTimeout(() => sendYtCommand('playVideo'), 400);
              }
            }}
          />
        </div>
      )}

      {/* =========================================================================
          VIEW A: EXPANDED PLAYER CARD
          ========================================================================= */}
      {isExpanded && (
        <div className="music-player-card">
          
          {/* Header */}
          <div className="music-card-header">
            <div className="music-header-title-wrap">
              <span className="music-header-badge">
                <Radio size={12} className={isPlaying ? 'icon-pulse' : ''} />
                <span>FP Sound</span>
              </span>
              
              {/* Animated Equalizer Wave Bars */}
              {isPlaying && (
                <div className="music-eq-bars" aria-label="Playing equalizer">
                  <span className="eq-bar eq-bar-1" />
                  <span className="eq-bar eq-bar-2" />
                  <span className="eq-bar eq-bar-3" />
                  <span className="eq-bar eq-bar-4" />
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn-music-collapse"
              onClick={() => setIsExpanded(false)}
              title="ย่อแถบเครื่องเล่นเพลง"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Spotify Direct Embed View (If active track is Spotify) */}
          {currentTrack?.source === 'spotify' && spotifyEmbedUrl ? (
            <div className="spotify-embed-card-wrap">
              <iframe
                title="Spotify Music Embed"
                src={spotifyEmbedUrl}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ borderRadius: '12px' }}
              />
            </div>
          ) : (
            <>
              {/* Track Info & Vinyl Art */}
              <div className="music-track-main">
                <div className={`music-disc-visual ${isPlaying ? 'spinning' : ''}`}>
                  <div className="disc-outer-groove">
                    <div className="disc-inner-core">
                      <Disc size={20} className="disc-center-icon" />
                    </div>
                  </div>
                </div>

                <div className="music-track-details">
                  <div className="track-title-row">
                    <h4 className="music-track-title" title={currentTrack?.title || 'ไม่มีชื่อเพลง'}>
                      {currentTrack?.title || 'เลือกเพลงจากเพลย์ลิสต์'}
                    </h4>
                  </div>
                  <p className="music-track-artist">
                    {currentTrack?.artist || 'FP Zerofour Lounge'}
                  </p>
                  <div className="track-source-tag">
                    <span className={`source-pill ${currentTrack?.source || 'youtube'}`}>
                      {currentTrack?.source === 'youtube' && 'YouTube'}
                      {currentTrack?.source === 'spotify' && 'Spotify'}
                      {currentTrack?.source === 'audio' && 'Direct Audio'}
                    </span>
                    {playlist.length > 1 && (
                      <span className="track-order-text">
                        {`${currentTrackIndex + 1}/${playlist.length}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Slider (เลื่อนเพลง / กรอเพลง) */}
              <div className="music-progress-bar-wrap">
                <span className="time-text">{formatTime(currentTime)}</span>
                <div className="progress-slider-container">
                  <input
                    type="range"
                    min={0}
                    max={duration > 0 ? duration : 210}
                    value={currentTime}
                    onChange={handleSeekChange}
                    className="music-progress-slider"
                    title="ลากเพื่อเลื่อนเวลาเพลง"
                    style={{
                      background: `linear-gradient(to right, #a855f7 0%, #8b5cf6 ${((currentTime / (duration || 210)) * 100).toFixed(1)}%, rgba(255, 255, 255, 0.15) ${((currentTime / (duration || 210)) * 100).toFixed(1)}%, rgba(255, 255, 255, 0.15) 100%)`
                    }}
                  />
                </div>
                <span className="time-text">{formatTime(duration || 210)}</span>
              </div>

              {/* Controls: Prev, Seek -10s, Play/Pause, Seek +10s, Next */}
              <div className="music-playback-controls">
                {playlist.length > 1 && (
                  <button
                    type="button"
                    className="btn-music-skip"
                    onClick={handlePrevTrack}
                    title="เพลงก่อนหน้า"
                  >
                    <SkipBack size={18} />
                  </button>
                )}

                {/* ปุ่มเลื่อนเพลงย้อนหลัง 10 วินาที */}
                <button
                  type="button"
                  className="btn-music-skip btn-music-seek"
                  onClick={() => handleSeekOffset(-10)}
                  title="เลื่อนย้อนหลัง 10 วินาที"
                >
                  <RotateCcw size={17} />
                  <span className="btn-skip-sec">10</span>
                </button>

                <button
                  type="button"
                  className={`btn-music-main-play ${isPlaying ? 'playing' : ''}`}
                  onClick={togglePlay}
                  title={isPlaying ? 'หยุดเล่นชั่วคราว (Pause)' : 'เล่นเพลง (Play)'}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="play-icon-offset" />}
                </button>

                {/* ปุ่มเลื่อนเพลงไปข้างหน้า 10 วินาที */}
                <button
                  type="button"
                  className="btn-music-skip btn-music-seek"
                  onClick={() => handleSeekOffset(10)}
                  title="เลื่อนไปข้างหน้า 10 วินาที"
                >
                  <RotateCw size={17} />
                  <span className="btn-skip-sec">10</span>
                </button>

                {playlist.length > 1 && (
                  <button
                    type="button"
                    className="btn-music-skip"
                    onClick={handleNextTrack}
                    title="เพลงถัดไป"
                  >
                    <SkipForward size={18} />
                  </button>
                )}
              </div>

              {/* Volume Slider & Mute Toggle */}
              <div className="music-volume-section">
                <button
                  type="button"
                  className="btn-music-mute"
                  onClick={toggleMute}
                  title={isMuted ? 'เปิดเสียง (Unmute)' : 'ปิดเสียง (Mute)'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={17} className="muted-icon" />
                  ) : volume < 50 ? (
                    <Volume1 size={17} />
                  ) : (
                    <Volume2 size={17} />
                  )}
                </button>

                <div className="music-volume-slider-wrap">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="music-volume-slider"
                    aria-label="ปรับระดับเสียงเพลง"
                  />
                </div>
                
                <span className="music-volume-percent">
                  {isMuted ? '0%' : `${volume}%`}
                </span>
              </div>
            </>
          )}

        </div>
      )}

      {/* =========================================================================
          VIEW B: COLLAPSED COMPACT PILL / VINYL BADGE
          ========================================================================= */}
      {!isExpanded && (
        <div 
          className={`music-pill-trigger ${isPlaying ? 'is-playing' : ''}`}
          onClick={() => setIsExpanded(true)}
          role="button"
          tabIndex={0}
          title="คลิกเพื่อเปิดเครื่องเล่นเพลงเต็ม"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setIsExpanded(true);
          }}
        >
          {/* Spinning Vinyl Disc (Compact) */}
          <div className={`mini-disc-wrap ${isPlaying ? 'spinning' : ''}`}>
            <Disc size={13} className="mini-disc-icon" />
            {isPlaying && <span className="mini-glow-pulse" />}
          </div>

          {/* Single-line Track Title */}
          <div className="mini-info-wrap">
            <span className="mini-title-text">
              {currentTrack?.title 
                ? (currentTrack.title.length > 12 ? currentTrack.title.slice(0, 12) + '...' : currentTrack.title)
                : 'FP TCG'}
            </span>
          </div>

          {/* Direct Play/Pause Button on Collapsed Pill */}
          <button
            type="button"
            className="mini-play-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            title={isPlaying ? 'หยุดเล่น' : 'เล่นเพลง'}
          >
            {isPlaying ? <Pause size={10} /> : <Play size={10} className="play-icon-offset-sm" />}
          </button>

          {/* Direct Volume Toggle */}
          <button
            type="button"
            className="mini-volume-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
          >
            {isMuted ? <VolumeX size={10} /> : <Volume2 size={10} />}
          </button>
        </div>
      )}
    </aside>
  );
}
