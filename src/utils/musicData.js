// =========================================================================
// FP ZEROFOUR BACKGROUND MUSIC DATA & HELPER UTILITIES
// Supports YouTube, Spotify, and Direct Audio (MP3/Stream)
// =========================================================================

export const DEFAULT_MUSIC_SETTINGS = {
  enabled: true,
  autoplay: true, // Default true to play on load / first touch
  defaultVolume: 45, // 0 - 100
  activeTrackId: 'track-fp-tcg',
  track: {
    id: 'track-fp-tcg',
    title: 'FP TCG - Cyber Gaming Theme',
    artist: 'FP TCG Sound',
    source: 'youtube',
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY', // Neon Synthwave Gaming Beat (Not Lofi)
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&q=80'
  },
  playlist: [
    {
      id: 'track-fp-tcg',
      title: 'FP TCG - Cyber Gaming Theme',
      artist: 'FP TCG Sound',
      source: 'youtube',
      url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
      thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&q=80'
    }
  ]
};

const STORAGE_KEY = 'fp_zerofour_music_settings_v3';

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
  const clean = url.trim();
  // Support youtu.be, watch?v=, embed/, shorts/, live/, m.youtube.com, etc.
  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i);
  if (match) return match[1];

  try {
    const parsed = new URL(clean);
    const v = parsed.searchParams.get('v');
    if (v && v.length === 11) return v;
  } catch {}

  return '';
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
    // Purge any old v1 or v2 storage that had lofi
    try {
      const v1 = localStorage.getItem('fp_zerofour_music_settings_v1');
      if (v1 && (v1.includes('jfKfPfyJRdk') || v1.toLowerCase().includes('lofi'))) {
        localStorage.removeItem('fp_zerofour_music_settings_v1');
      }
      const v2 = localStorage.getItem('fp_zerofour_music_settings_v2');
      if (v2 && (v2.includes('jfKfPfyJRdk') || v2.toLowerCase().includes('lofi'))) {
        localStorage.removeItem('fp_zerofour_music_settings_v2');
      }
    } catch {}

    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('fp_zerofour_music_settings_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      // If parsed contains old Lofi Girl track, purge it completely
      if (
        parsed.track?.url?.includes('jfKfPfyJRdk') ||
        parsed.playlist?.some(t => t.url?.includes('jfKfPfyJRdk')) ||
        parsed.track?.title?.toLowerCase().includes('lofi')
      ) {
        localStorage.removeItem(STORAGE_KEY);
        return DEFAULT_MUSIC_SETTINGS;
      }

      const activeTrack = parsed.track || (Array.isArray(parsed.playlist) && parsed.playlist[0]) || DEFAULT_MUSIC_SETTINGS.track;

      return {
        ...DEFAULT_MUSIC_SETTINGS,
        ...parsed,
        track: activeTrack,
        playlist: Array.isArray(parsed.playlist) && parsed.playlist.length > 0 
          ? parsed.playlist 
          : [activeTrack]
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
