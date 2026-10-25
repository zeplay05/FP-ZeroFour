// =========================================================================
// FP ZEROFOUR BACKGROUND MUSIC DATA & HELPER UTILITIES
// Supports YouTube, Spotify, and Direct Audio (MP3/Stream)
// =========================================================================

export const DEFAULT_MUSIC_SETTINGS = {
  enabled: true,
  autoplay: false, // Default false to respect browser autoplay policies
  defaultVolume: 40, // 0 - 100
  activeTrackId: 'track-1',
  playlist: [
    {
      id: 'track-1',
      title: 'Chill Lofi Study / Relax Beats',
      artist: 'Lofi Girl / FP Chill Lounge',
      source: 'youtube',
      url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', // Lofi Beats YouTube
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&q=80'
    },
    {
      id: 'track-2',
      title: 'Neon Cyberpunk / Synthwave Night',
      artist: 'FP Zerofour Radio',
      source: 'youtube',
      url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY', // Synthwave Chill
      thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&q=80'
    },
    {
      id: 'track-3',
      title: 'Peaceful Ambient Lo-Fi Chill',
      artist: 'FP Zen Space',
      source: 'audio',
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3', // Direct chill MP3
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&q=80'
    }
  ]
};

const STORAGE_KEY = 'fp_zerofour_music_settings_v1';

/**
 * Detect track source type from URL
 * Returns: 'youtube' | 'spotify' | 'audio'
 */
export function detectSourceType(url = '') {
  if (!url) return 'youtube';
  const trimmed = url.trim().toLowerCase();
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    return 'youtube';
  }
  if (trimmed.includes('spotify.com') || trimmed.startsWith('spotify:')) {
    return 'spotify';
  }
  if (trimmed.endsWith('.mp3') || trimmed.endsWith('.wav') || trimmed.endsWith('.ogg') || trimmed.endsWith('.m4a')) {
    return 'audio';
  }
  return 'youtube';
}

/**
 * Extract YouTube video ID
 */
export function extractYouTubeId(url = '') {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  return match ? match[1] : '';
}

/**
 * Extract Spotify Embed URL
 */
export function extractSpotifyEmbedUrl(url = '') {
  if (!url) return '';
  try {
    const clean = url.trim();
    if (clean.includes('/embed/')) {
      return clean;
    }
    const match = clean.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
    if (match) {
      return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
    }
    return clean;
  } catch {
    return url;
  }
}

/**
 * Load music settings from localStorage with default fallback
 */
export function loadMusicSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_MUSIC_SETTINGS,
        ...parsed,
        playlist: Array.isArray(parsed.playlist) && parsed.playlist.length > 0 
          ? parsed.playlist 
          : DEFAULT_MUSIC_SETTINGS.playlist
      };
    }
  } catch (err) {
    console.error('Failed to parse music settings from localStorage', err);
  }
  return DEFAULT_MUSIC_SETTINGS;
}

/**
 * Save music settings to localStorage and notify other components
 */
export function saveMusicSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('fp_music_settings_updated', { detail: settings }));
    return true;
  } catch (err) {
    console.error('Failed to save music settings', err);
    return false;
  }
}

/**
 * Auto fetch metadata (Title, Artist/Author, Thumbnail) for a given URL (YouTube, Spotify, or Audio)
 */
export async function fetchMusicMetadata(url = '') {
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  const source = detectSourceType(cleanUrl);

  // 1. YouTube
  if (source === 'youtube') {
    const ytId = extractYouTubeId(cleanUrl);
    try {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(cleanUrl)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.title && !data.error) {
          return {
            title: data.title,
            artist: data.author_name || 'YouTube Music',
            thumbnail: data.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : ''),
            source: 'youtube'
          };
        }
      }
    } catch {
      // Ignore network failure and try fallback
    }

    try {
      const res2 = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`);
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.title) {
          return {
            title: data2.title,
            artist: data2.author_name || 'YouTube Music',
            thumbnail: data2.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : ''),
            source: 'youtube'
          };
        }
      }
    } catch {
      // Fallback
    }

    return {
      title: ytId ? `YouTube Music (${ytId})` : 'YouTube Music',
      artist: 'YouTube',
      thumbnail: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '',
      source: 'youtube'
    };
  }

  // 2. Spotify
  if (source === 'spotify') {
    try {
      const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(cleanUrl)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.title) {
          let title = data.title;
          let artist = 'Spotify Artist';
          if (title.includes('a song by')) {
            const parts = title.split('a song by');
            title = parts[0].replace(/,\s*$/, '').trim();
            artist = parts[1].replace(/on Spotify/i, '').trim();
          } else if (title.includes(' - ')) {
            const parts = title.split(' - ');
            title = parts[0].trim();
            artist = parts[1].trim();
          }
          return {
            title: title || data.title,
            artist: artist || data.provider_name || 'Spotify',
            thumbnail: data.thumbnail_url || '',
            source: 'spotify'
          };
        }
      }
    } catch {
      // Fallback
    }

    return {
      title: 'Spotify Track',
      artist: 'Spotify',
      thumbnail: '',
      source: 'spotify'
    };
  }

  // 3. Direct Audio
  if (source === 'audio') {
    try {
      const filename = cleanUrl.split('/').pop().split('?')[0];
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const prettyTitle = nameWithoutExt.replace(/\b\w/g, l => l.toUpperCase());
      return {
        title: prettyTitle || 'Audio Stream',
        artist: 'Direct Audio Stream',
        thumbnail: '',
        source: 'audio'
      };
    } catch {
      return {
        title: 'Audio File',
        artist: 'Direct Audio',
        thumbnail: '',
        source: 'audio'
      };
    }
  }

  return {
    title: 'Music Track',
    artist: 'FP Zerofour',
    thumbnail: '',
    source
  };
}
